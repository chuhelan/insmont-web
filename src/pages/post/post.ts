import { enableDarkMode } from '../index';
import axios, { CancelToken } from 'axios';
import "/node_modules/preline/dist/preline.js";

import * as QRCode from 'qrcode';

const source = axios.CancelToken.source();
const cancelToken: CancelToken = source.token;

const personalAccount = "../assets/personal.svg";
const companyAccount = "../assets/company.svg";
const governmentAccount = "../assets/government.svg";
const organizationAccount = "../assets/organization.svg";
const insmontAccount = "../assets/official.svg";

function getFullYear(): string {
    return new Date().getFullYear().toString();
}

document.getElementById('year').innerHTML = getFullYear();
document.addEventListener('DOMContentLoaded', (): void => {
    enableDarkMode();
});


function getCookieValue(cookieName: string): string | null {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }

    return null;
}

async function verifyToken(uid: string, token: string): Promise<boolean> {

    const requestData: FormData = new FormData();
    requestData.append("id", uid);
    requestData.append("token", token);

    try {
        const response = await axios.post("http://localhost:2077/v1/user/verify", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });
        if (response.data.code === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function loadingDialog(): void {
    document.getElementById("loadingDialog").classList.remove("hidden");
}

function removeLoadingDialog(): void {
    document.getElementById("loadingDialog").classList.add("hidden");
}

function showDialog(title: string, content: string): void {
    const dialog = document.getElementById("hs-subscription-with-image");
    if (dialog) {
        dialog.classList.remove("hidden");
        document.getElementById("topTitle").innerHTML = title;
        document.getElementById("contentView").innerHTML = content;
    }
}

function getUserIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    return userId;
}

function signOutAccount() {
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document.addEventListener("click", function (event) {
    if (event.target === document.getElementById("signOutAccount")) {
        signOutAccount();
        window.location.href = "/";
    }

    if (event.target === document.getElementById("switchAccount")) {
        signOutAccount();
        window.location.href = "/login";
    }
});

async function getUserInfo(id: string): Promise<any> {
    const url = "http://localhost:2077/v1/user/info?id=" + id;

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return response.data.data;
        } else if (response.data.code === 403) {
            showDialog("网络超时", "请检查网络连接是否正常");
            throw new Error("网络超时");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getUserPostInfo(uid: string): Promise<any> {
    const url = "http://localhost:2077/v1/post/userinfo?id=" + uid;

    try {
        const reponse = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (reponse.data.id !== null) {
            return reponse.data;
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
            throw new Error("网络超时");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function generateQRCode(url: string): Promise<string> {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        return qrCodeDataUrl;
    } catch (err) {
        alert(err);
        return '';
    }
}

async function setQRImage(userid: string) {
    const qrUrl = document.getElementById("qrcodeUrl");
    const qrImage = document.getElementById("qrcodePicture") as HTMLImageElement;



    let url = window.location.origin + "/user/?id=" + userid;
    qrUrl.innerHTML = url;


    qrImage.src = await generateQRCode(url);
}

function CookieOrBroswerIdSelecter(): string {
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    if (broswerId !== null && broswerId.length > 0) {
        return broswerId;
    } else {
        return cookieid;
    }
}

async function setTopBannerInfo() {

    const cookieid = getCookieValue("uid");
    const cookieUserInfo = await getUserInfo(cookieid);

    document.getElementById("userTopLoadingPicture").classList.add("hidden");
    document.getElementById("userTopPicture").classList.remove("hidden");
    document.getElementById("userTopPicture").setAttribute("src", cookieUserInfo.avatar);

    document.getElementById("userTopName").innerHTML = cookieUserInfo.username;

    setTopBannerVerificationIcon(cookieUserInfo.verification);

}

function setCardVerificationIcon(verificationCode: number) {

    if (verificationCode !== 0) {

        const verificationDiv = document.getElementById("userVerification");
        verificationDiv.classList.add('justify-center', 'items-center', 'flex')

        const imageElement = document.createElement("img");
        imageElement.classList.add('h-4', 'w-4');

        switch (verificationCode) {
            case 1:
                // 个人认证账户
                imageElement.src = personalAccount;
                break;
            case 2:
                // 企业认证账户
                imageElement.src = companyAccount;
                break;
            case 3:
                // 政府认证账户
                imageElement.src = governmentAccount;
                break;
            case 4:
                // 组织认证账户
                imageElement.src = organizationAccount;
                break;
            case 5:
                // insmont 官方认证账户
                imageElement.src = insmontAccount;
                break;
        }
        verificationDiv.appendChild(imageElement);

    }
}

function setTopBannerVerificationIcon(verificationCode: number) {

    const topVerificationDiv = document.getElementById("userTopVerification");
    topVerificationDiv.classList.add('items-center', 'flex')

    const topImageElement = document.createElement("img");
    topImageElement.classList.add('h-4', 'w-4');

    switch (verificationCode) {
        case 1:
            // 个人认证账户
            topImageElement.src = personalAccount;
            break;
        case 2:
            // 企业认证账户
            topImageElement.src = companyAccount;
            break;
        case 3:
            // 政府认证账户
            topImageElement.src = governmentAccount;
            break;
        case 4:
            // 组织认证账户
            topImageElement.src = organizationAccount;
            break;
        case 5:
            // insmont 官方认证账户
            topImageElement.src = insmontAccount;
            break;
    }
    topVerificationDiv.appendChild(topImageElement);
}

async function setLeftCardInfo(id: string) {

    const userInfo = await getUserInfo(id);
    const userPostInfo = await getUserPostInfo(id);

    document.getElementById("userLoadingPicture").classList.add("hidden");
    document.getElementById("userPicture").classList.remove("hidden");
    document.getElementById("userPicture").setAttribute("src", userInfo.avatar);
    document.getElementById("userPicture").classList.add("cursor-pointer");
    document.getElementById("userPicture").setAttribute("loading", "lazy");
    document.getElementById("userPicture").setAttribute("alt", userInfo.username);
    document.getElementById("userPicture").setAttribute("onclick", `window.open("/user/?id=${id}")`);

    document.getElementById("userLoadingName").classList.add("hidden");
    document.getElementById("username").classList.remove("hidden");
    document.getElementById("username").innerHTML = userInfo.username;

    document.getElementById("userLoadingLocation").classList.add("hidden");
    document.getElementById("userLocation").classList.remove("hidden");
    document.getElementById("userLocation").innerHTML = userInfo.location;

    document.getElementById("userLoadingBio").classList.add("hidden");
    if (userInfo.bio !== null) {
        document.getElementById("userBio").classList.remove("hidden");
        document.getElementById("userBio").innerHTML = userInfo.bio;
    }

    document.getElementById("userLoadingPost").classList.add("hidden");
    document.getElementById("userPost").classList.remove("hidden");
    document.getElementById("userPost").innerHTML = userPostInfo.tweets;

    document.getElementById("userLoadingFans").classList.add("hidden");
    document.getElementById("userFans").classList.remove("hidden");
    document.getElementById("userFans").innerHTML = userPostInfo.fans;

    document.getElementById("userLoadingFollows").classList.add("hidden");
    document.getElementById("userFollows").classList.remove("hidden");
    document.getElementById("userFollows").innerHTML = userPostInfo.follows;

    setCardVerificationIcon(userInfo.verification);

}


async function showLatestPostLimit5(id: string): Promise<any> {
    const url = "http://localhost:2077/v1/user/following/latest?id=" + id;
    try {
        const reponse = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (reponse.data.code === 200) {
            return reponse.data.data.List;
        } else if (reponse.data.code === 401) {
            showDialog("网络超时", "请检查网络连接是否正常");
            throw new Error("网络超时");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

interface UserInfo {
    id: string;
    username: string;
    avatar: string;
}

async function setFollowingList(userid: string) {

    const userId = userid;
    const userinfo = await showLatestPostLimit5(userId);

    if (userinfo.length === 0) {
        document.getElementById("haventFollowPerson").classList.remove("hidden");
    }

    userinfo.forEach((user: UserInfo) => {
        singleFollowingUser(user);
    });
}

const followButton = document.getElementById("FollowButton");
const unFollowButton = document.getElementById("UnFollowButton");
const followersNumber = document.getElementById("userFans");

async function showFollowUnFollowButton(userid: string) {
    const cookieid = getCookieValue("uid");
    const broswerId = userid

    if (cookieid !== broswerId && broswerId !== null && broswerId.length > 0) {
        isFollowed(cookieid, broswerId).then((result) => {
            if (result === 1) {
                unFollowButton.classList.remove("hidden");
            } else if (result === 0) {
                followButton.classList.remove("hidden");
            }
        });
    }
}


followButton.addEventListener("click", async () => {
    const cookieid = getCookieValue("uid");
    const postUserId = await getPostInfo().then((data) => data.author)

    if (cookieid !== postUserId && postUserId !== null && postUserId.length > 0) {
        await follow(cookieid, postUserId);
    }
});

unFollowButton.addEventListener("click", async () => {
    const cookieid = getCookieValue("uid");
    const postUserId = await getPostInfo().then((data) => data.author)

    if (cookieid !== postUserId && postUserId !== null && postUserId.length > 0) {
        unfollow(cookieid, postUserId);
    }
});


async function follow(follower: string, following: string) {
    const requestData: FormData = new FormData();
    requestData.append("follower", follower);
    requestData.append("following", following);

    try {
        const response = await axios.post("http://localhost:2077/v1/follow", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            followButton.classList.add("hidden");
            unFollowButton.classList.remove("hidden");
            followersNumber.innerHTML = (parseInt(followersNumber.innerHTML) + 1).toString();
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}

async function unfollow(follower: string, following: string) {
    try {
        const response = await axios.delete(`http://localhost:2077/v1/unfollow?follower=${follower}&following=${following}`, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            followButton.classList.remove("hidden");
            unFollowButton.classList.add("hidden");
            followersNumber.innerHTML = (parseInt(followersNumber.innerHTML) - 1).toString();
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}



async function isFollowed(id: string, targetUser: string) {
    const requestData: FormData = new FormData();
    requestData.append("id", id);
    requestData.append("targetUser", targetUser);

    try {
        const response = await axios.get("http://localhost:2077/v1/followed", {
            params: {
                id: id,
                targetUser: targetUser
            },
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 1;
        } else if (response.data.code === 401) {
            return 0;
        } else {
            return 3;
        }

    } catch (error) {
        console.log(error);
    }
}

function singleFollowingUser(user: UserInfo) {
    const li = document.createElement("li");
    li.classList.add("flex", "flex-col", "items-center", "space-y-3");
    li.style.transform = "translateX(0px)";
    li.style.opacity = "1";


    const a = document.createElement("a");
    a.classList.add("block", "bg-white", "p-1", "rounded-full", "border-2", "border-green-500");
    a.setAttribute("href", `/user/?id=${user.id}`);
    a.setAttribute("target", "_blank");

    const img = document.createElement("img");
    img.classList.add("h-12", "w-12", "rounded-full", "cursor-pointer");
    img.setAttribute("src", user.avatar);
    img.setAttribute("alt", user.username);
    img.setAttribute("loading", "lazy");


    const span = document.createElement("span");
    span.classList.add("text-xs", "text-gray-500");
    span.textContent = user.username;

    li.appendChild(a);
    a.appendChild(img);
    li.appendChild(span);

    const ul = document.getElementById("followingList");
    ul.appendChild(li);
}

async function setHTMLInfo() {

    const postAuthorId = await getPostInfo().then((data) => data.author)
    const cookieid = getCookieValue("uid");


    const cookieUserInfo = await getUserInfo(cookieid);
    const postUserInfo = await getUserInfo(postAuthorId);

    if (postAuthorId !== null && postAuthorId.length > 0) {
        document.title = "insmont | " + postUserInfo.username;
    } else {
        document.title = "insmont | " + cookieUserInfo.username;
    }

    setTopBannerInfo();
    setLeftCardInfo(postAuthorId);
    setFollowingList(postAuthorId);
    setQRImage(postAuthorId);
    showFollowUnFollowButton(postAuthorId);
    await setPostInfo();
}

document.getElementById('year').innerHTML = getFullYear();
document.addEventListener('DOMContentLoaded', (): void => {
    setTimeout(() => {
        setHTMLInfo();
    }, 0);
});

function getPostIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    return postId;
}



async function getPostInfo(): Promise<any> {
    const postId = getPostIdFromUrl();
    const url = "http://localhost:2077/v1/post/info?post_id=" + postId;

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            // alert(response.data.data.post.author);
            return response.data.data.post;
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
            throw new Error("网络超时");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

interface ImageLayout {
    largeRows: number;
    smallRows: number;
}

function calculateImageLayout(totalImages: number): ImageLayout {
    const layout: ImageLayout = { largeRows: 0, smallRows: 0 };
    if (totalImages === 1) {
        layout.largeRows = 1;
    } else if (totalImages === 2) {
        layout.largeRows = 1;
    } else if (totalImages === 3) {
        layout.smallRows = 1;
    } else if (totalImages === 4) {
        layout.largeRows = 2;
    } else if (totalImages === 5) {
        layout.largeRows = 1;
        layout.smallRows = 1;
    } else if (totalImages === 6) {
        layout.smallRows = 2;
    } else if (totalImages === 7) {
        layout.largeRows = 2;
        layout.smallRows = 1;
    } else if (totalImages === 8) {
        layout.largeRows = 1;
        layout.smallRows = 2;
    } else if (totalImages === 9) {
        layout.smallRows = 3;
    } else {
        console.log("Unsupported number of images:", totalImages);
    }
    return layout;
}

const imageDialog = document.getElementById("imageDialog");
const imageDialogImage = document.getElementById("imageDialogImage") as HTMLImageElement;
function showImageDialog(imageURL: string) {
    imageDialog.classList.remove("hidden");
    imageDialogImage.src = imageURL;
}

document.getElementById("closeImageDialog").addEventListener("click", function () {
    imageDialog.classList.add("hidden");
});

async function setPostInfo() {


    
    const postInfo = await getPostInfo();

    const postList = document.getElementById("postList");

    const noAuthDiv = document.createElement("div");
    noAuthDiv.classList.add("bg-white", "shadow", "rounded-lg", "mb-6", "dark:bg-slate-900");
    noAuthDiv.innerHTML = `
    <div class="flex flex-col items-center p-4">
        <div class="text-gray-600 dark:text-gray-200 text-lg font-bold mb-2">无权限查看</div>
        <div class="text-gray-400 dark:text-gray-300 text-sm">您没有权限查看该帖子</div>
    </div>
    `;

    //post最外层div
    const outterDiv = document.createElement("div");
    outterDiv.classList.add("bg-white", "shadow", "rounded-lg", "mb-6", "dark:bg-slate-900");
    outterDiv.setAttribute("post-id", postInfo.post_id);

    //post顶栏
    const postTopDiv = document.createElement("div");
    postTopDiv.classList.add("hs-dropdown", "flex", "flex-row", "px-2", "py-3", "mx-3", "relative");
    const postTopImageDiv = document.createElement("div");
    postTopImageDiv.classList.add("w-auto", "h-auto", "rounded-full");

    // post设置权限
    const postTopSettingDiv = document.createElement("button");
    postTopSettingDiv.setAttribute("type", "button");
    postTopSettingDiv.setAttribute("id", "postSettings"+postInfo.post_id);
    postTopSettingDiv.classList.add("inline-flex", "ml-auto", "flex", "cursor-pointer", "justify-end", "text-gray-400", "dark:text-gray-200", "items-center");
    const svginfo = `
    <svg class="text-gray-600 dark:text-white h-6 w-6 justify-center items-center" aria-hidden="true" data-slot="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"></path>
    </svg>
    `;
    postTopSettingDiv.innerHTML = svginfo;

    // post设置权限下拉菜单
    const postTopSettingDropdownDiv = document.createElement("div");
    postTopSettingDropdownDiv.classList.add( "absolute", "right-0", "top-0", "hidden", "z-10", "bg-white", "shadow-lg", "rounded-b-xl", "dark:bg-gray-800", "dark:border", "dark:border-gray-700", "dark:divide-gray-700", "block");
    const dropDownTemp = `
    <ul class="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
    <li>
        <div class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
            <label class="inline-flex items-center w-full cursor-pointer">
                <input postPublic="${postInfo.post_id}" type="checkbox" value="" class="sr-only peer" ${postInfo.visibility =='true' ? 'checked' : ''}>
                <div
                    class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600">
                </div>
                <span class="ml-3 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    公开帖子
                </span>
            </label>
        </div>
    </li>
    <li>
        <div class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
            <label class="inline-flex items-center w-full cursor-pointer">
                <input postComment="${postInfo.post_id}" type="checkbox" value="" class="sr-only peer" ${postInfo.comment_permission == 1 ? 'checked':''} >
                <div
                    class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600">
                </div>
                <span class="ml-3 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    允许评论
                </span>
            </label>
        </div>
    </li>
    <li>
        <div postDelete="${postInfo.post_id}" class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm font-medium text-red-600">
            <svg class="h-5 w-5" data-slot="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"></path>
            </svg>
            <span class="text-red-600 ml-3 ms-3 text-sm font-medium dark:text-gray-300">
                删除该帖子
            </span>
        </div>
        
    </li>
</ul>
<div postSave="${postInfo.post_id}" class="cursor-pointer block py-2 text-sm font-medium text-center text-gray-900 rounded-b-lg bg-gray-50 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:text-white">
    <div class="inline-flex items-center ">
        保&nbsp;存
    </div>
</div>
    `;
    postTopSettingDropdownDiv.innerHTML = dropDownTemp;


    // 点击按钮显示或隐藏下拉菜单
    postTopSettingDiv.addEventListener("click", function (event) {
        event.stopPropagation(); // 阻止事件冒泡，避免立即隐藏下拉菜单
        postTopSettingDropdownDiv.classList.toggle("hidden");
    });

    // 点击其他地方隐藏下拉菜单
    document.addEventListener("click", async function (event) {
        const targetNode = event.target as Node;
        const target = event.target as HTMLElement;

        if (!postTopSettingDropdownDiv.contains(targetNode)) {
            postTopSettingDropdownDiv.classList.add("hidden");
        }

        // 检查点击的元素是否是 postDelete
        const postDeleteDiv = target.closest(`div[postDelete="${postInfo.post_id}"]`);
        if (postDeleteDiv) {
            // 处理删除帖子的逻辑
            if (await deletePost(postInfo.post_id) == 200) {
                showDialog("删除成功", "帖子已经成功删除");
                window.location.href = "/user/?id=" + postInfo.author;
            }
            return;
        }

        // 检查点击的元素是否是 postSave
        const saveButton = target.closest(`div[postSave="${postInfo.post_id}"]`);
        if (saveButton) {
            // 处理保存帖子的逻辑
            const visibilityContain = document.querySelector(`input[postPublic="${postInfo.post_id}"]`) as HTMLInputElement;
            const comment_permissionContain = document.querySelector(`input[postComment="${postInfo.post_id}"]`) as HTMLInputElement;

            const visibility = visibilityContain.checked ? 'true' : 'false';
            const comment_permission: number = comment_permissionContain.checked ? 1 : 0;

            if (await updatePostPrivacy(postInfo.post_id, visibility, comment_permission) == 200) {
                showDialog("保存成功", "帖子已经成功保存");
            }
            return;
        }
    });


    // post顶栏图片
    const postTopImage = document.createElement("img");
    postTopImage.classList.add("w-12", "h-12", "rounded-full", "cursor-pointer", "border-green-500", "border-2");
    postTopImage.setAttribute("src", postInfo.author_avatar);
    postTopImage.setAttribute("loading", "lazy");
    postTopImage.setAttribute("alt", postInfo.author);
    postTopImage.setAttribute("onclick", `window.open("/user/?id=${postInfo.author}")`);
    //post顶栏用户区域
    const postTopUserDiv = document.createElement("div");
    postTopUserDiv.classList.add("flex", "flex-col", "mb-2", "ml-4", "mt-1");
    //post顶栏post用户昵称
    const postTopPostUserNameDiv = document.createElement("div");
    postTopPostUserNameDiv.classList.add("text-gray-600", "dark:text-gray-200", "text-sm", "font-semibold", "items-center", "flex", "cursor-pointer");
    postTopPostUserNameDiv.innerHTML = postInfo.author_name;
    postTopPostUserNameDiv.setAttribute("onclick", `window.open("/user/?id=${postInfo.author}")`);
    //post顶栏post用户认证图标
    if (postInfo.author_verification !== 0) {
        const postTopPostUserVerificationImage = document.createElement("img");
        postTopPostUserVerificationImage.classList.add("ml-2", "h-4", "w-4");
        switch (postInfo.author_verification) {
            case 1:
                postTopPostUserVerificationImage.setAttribute("src", personalAccount);
                break;
            case 2:
                postTopPostUserVerificationImage.setAttribute("src", companyAccount);
                break;
            case 3:
                postTopPostUserVerificationImage.setAttribute("src", governmentAccount);
                break;
            case 4:
                postTopPostUserVerificationImage.setAttribute("src", organizationAccount);
                break;
            case 5:
                postTopPostUserVerificationImage.setAttribute("src", insmontAccount);
                break;
        }
        postTopPostUserNameDiv.appendChild(postTopPostUserVerificationImage);
    }
    //post顶栏归属地和计算时间
    const postTopPostLocationTimeDiv = document.createElement("div");
    postTopPostLocationTimeDiv.classList.add("flex", "w-full", "mt-1");
    //post顶栏归属地
    const postTopPostLocationDiv = document.createElement("div");
    postTopPostLocationDiv.classList.add("text-blue-700", "dark:text-gray-400", "font-base", "text-xs", "mr-1", "cursor-pointer");
    postTopPostLocationDiv.innerHTML = "IP&nbsp;属地：" + postInfo.location;
    //post顶栏计算时间
    const postTopPostTimeDiv = document.createElement("div");
    postTopPostTimeDiv.classList.add("text-gray-400", "font-thin", "text-xs");
    postTopPostTimeDiv.innerHTML = "•&nbsp;" + calculatorTime(postInfo.datetime);
    //post顶栏底部边框
    const postTopPostBorder = document.createElement("div");
    postTopPostBorder.classList.add("border-b", "border-gray-100", "dark:border-gray-600");


    //post图片div
    const postImageDiv = document.createElement("div");
    postImageDiv.classList.add("text-gray-400", "font-medium", "text-sm", "mb-7", "mt-6", "mx-3", "px-2");
    //post图片内容
    if (postInfo.total_images !== 0) {
        const postImageControlDiv = document.createElement("div");
        postImageControlDiv.classList.add("grid", "grid-cols-6", "col-span-2", "gap-2");
        const layout = calculateImageLayout(postInfo.total_images);
        if (postInfo.total_images !== 1) {
            for (let i = 0; i < postInfo.total_images; i++) {
                const postImageDiv = document.createElement("div");
                postImageDiv.classList.add("overflow-hidden", "rounded-xl");
                const postImage = document.createElement("img");
                postImage.classList.add("w-full", "h-full", "object-cover", "rounded-xl", "cursor-pointer");
                postImage.setAttribute("src", postInfo.images[i]);
                postImage.setAttribute("loading", "lazy");
                postImage.setAttribute("id", `post-image-${i}`);
                if (i < layout.largeRows * 2) {
                    postImageDiv.classList.add("col-span-3", "max-h-[14rem]");
                } else {
                    postImageDiv.classList.add("col-span-2", "max-h-[10rem]");
                }

                postImage.addEventListener("click", function () {
                    showImageDialog(postInfo.images[i]);
                });

                postImageDiv.appendChild(postImage);
                postImageControlDiv.appendChild(postImageDiv);
            }
        } else {
            const postImageDiv = document.createElement("div");
            postImageDiv.classList.add("overflow-hidden", "rounded-xl");
            const postImage = document.createElement("img");
            postImage.classList.add("w-full", "h-full", "object-cover", "rounded-xl", "cursor-pointer");
            postImage.setAttribute("src", postInfo.images[0]);
            postImage.setAttribute("loading", "lazy");
            postImage.setAttribute("id", "post-image-0");
            postImageControlDiv.classList.remove("grid", "grid-cols-6", "col-span-2", "gap-2");

            postImage.addEventListener("click", function () {
                showImageDialog(postInfo.images[0]);
            });
            postImageDiv.appendChild(postImage);
            postImageControlDiv.appendChild(postImageDiv);
        }
        postImageDiv.appendChild(postImageControlDiv);
    }


    //post文字内容
    const postContentDiv = document.createElement("div");
    postContentDiv.classList.add("text-black", "font-bold", "dark:text-gray-200", "text-lg", "mb-6", "mx-3", "px-2");
    if (postInfo.total_images === 0) {
        postContentDiv.classList.add("mt-6")
    }
    postContentDiv.innerHTML = postInfo.content;

    //post点赞分享区域
    const postLikeShareDiv = document.createElement("div");
    postLikeShareDiv.classList.add("flex", "justify-start", "mb-4", "border-t", "border-gray-100", "dark:border-gray-600");
    //点赞区域
    const postLikeDiv = document.createElement("div");
    postLikeDiv.classList.add("flex", "w-full", "mt-1", "pt-2", "pl-5");
    const postUnlikeSpan = document.createElement("span");
    postUnlikeSpan.setAttribute("unlike", postInfo.post_id);
    postUnlikeSpan.classList.add("hidden", "mr-4", "transition", "ease-out", "duration-300", "hover:bg-gray-50", "bg-gray-100", "hover:dark:bg-gray-400", "dark:bg-gray-500", "h-8", "px-2", "py-2", "text-center", "rounded-full", "text-gray-100", "cursor-pointer");
    const unlikeTemp = `
    <svg class="h-4 w-4 dark:text-gray-200 text-red-500" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z">
        </path>
    </svg>
    `;
    postUnlikeSpan.innerHTML = unlikeTemp;

    const postLikeSpan = document.createElement("span");
    postLikeSpan.setAttribute("like", postInfo.post_id);
    postLikeSpan.classList.add("hidden", "mr-4", "transition", "ease-out", "duration-300", "hover:bg-gray-50", "bg-gray-100", "hover:dark:bg-gray-400", "dark:bg-gray-500", "h-8", "px-2", "py-2", "text-center", "rounded-full", "text-gray-100", "cursor-pointer");
    const likeTemp = `
    <svg class="h-4 w-4 text-red-500" fill="red" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z">
        </path>
    </svg>
    `;
    postLikeSpan.innerHTML = likeTemp;


    postLikeDiv.appendChild(postUnlikeSpan);
    postLikeDiv.appendChild(postLikeSpan);
    postLikeShareDiv.appendChild(postLikeDiv);

    if (await verifyPostLike(postInfo.post_id) === 200) {
        // 已经点赞 显示取消点赞 显示填充红心unlike
        postUnlikeSpan.classList.remove("hidden");
    } else if (await verifyPostLike(postInfo.post_id) === 201) {
        //显示空白红心 like
        postLikeSpan.classList.remove("hidden");
    }


    if (postInfo.total_likes !== 0) {

        for (let i = 0; i < postInfo.total_likes; i++) {
            const postLikerImageImg = document.createElement("img");
            postLikerImageImg.classList.add("inline-block", "object-cover", "w-8", "h-8", "-ml-2", "text-white", "border-2", "border-blue-300", "dark:border-white", "rounded-full", "shadow-sm", "cursor-pointer");
            postLikerImageImg.setAttribute("liker", postInfo.likes[i].id);
            postLikerImageImg.onclick = async function () {
                window.open(`/user/?id=${postInfo.likes[i].id}`);
            }
            postLikerImageImg.setAttribute("src", postInfo.likes[i].avatar);
            postLikerImageImg.setAttribute("loading", "lazy");
            postLikerImageImg.setAttribute("alt", postInfo.likes[i].username);
            postLikeDiv.appendChild(postLikerImageImg);
        }
    }

    //点赞 取消点赞逻辑
    postUnlikeSpan.onclick = async function () {
        const reponse = await likePost(postInfo.post_id);
        if (reponse === 200) {
            postLikeSpan.classList.remove("hidden");
            postUnlikeSpan.classList.add("hidden");
            const postLike = document.querySelector(`div[postLike="${postInfo.post_id}"]`);
            const currentLikes = parseInt(postLike.innerHTML);
            postLike.innerHTML = (currentLikes + 1).toString();

            const postLikerImageImg = document.createElement("img");
            postLikerImageImg.classList.add("inline-block", "object-cover", "w-8", "h-8", "-ml-2", "text-white", "border-2", "border-blue-300", "dark:border-white", "rounded-full", "shadow-sm", "cursor-pointer");
            postLikerImageImg.setAttribute("liker", getCookieValue("uid"));
            postLikerImageImg.onclick = async function () {
                window.open(`/user/?id=${getCookieValue("uid")}`);
            }

            const cookieInfo = await getUserInfo(getCookieValue("uid"));

            postLikerImageImg.setAttribute("src", cookieInfo.avatar);
            postLikerImageImg.setAttribute("loading", "lazy");
            postLikerImageImg.setAttribute("alt", cookieInfo.username);
            postLikeDiv.appendChild(postLikerImageImg);

        } else if (reponse === 401) {
            showDialog("401", "已经按赞过了，但是你怎么能看到这条报错的？");
        }
    }

    postLikeSpan.onclick = async function () {
        const reponse = await unLikePost(postInfo.post_id);
        if (reponse === 200) {
            postUnlikeSpan.classList.remove("hidden");
            postLikeSpan.classList.add("hidden");
            const postLike = document.querySelector(`div[postLike="${postInfo.post_id}"]`);
            const currentLikes = parseInt(postLike.innerHTML);
            postLike.innerHTML = (currentLikes - 1).toString();

            const postLikerImageImg = document.querySelector(`img[liker="${getCookieValue("uid")}"]`);
            postLikeDiv.removeChild(postLikerImageImg);

        } else if (reponse === 401) {
            showDialog("401", "已经取消按赞了，但是你怎么能看到这条报错的？");
        }
    }

    const postShareDiv = document.createElement("div");
    postShareDiv.classList.add("flex", "justify-end", "w-full", "mt-1", "pt-2", "pr-5");
    const postShareSpan = document.createElement("span");
    postShareSpan.classList.add("transition", "ease-out", "duration-300", "dark:text-gray-200", "hover:bg-blue-50", "bg-blue-100", "hover:dark:bg-gray-400", "dark:bg-gray-500", "w-8", "h-8", "px-2", "py-2", "text-center", "rounded-full", "text-blue-400", "cursor-pointer", "mr-2");
    const shareTemp = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="14px" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z">
            </path>
        </svg>
    `;
    postShareSpan.innerHTML = shareTemp;
    postShareDiv.appendChild(postShareSpan);
    postLikeShareDiv.appendChild(postShareDiv);

    postShareDiv.addEventListener("click", async () => {
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        alert("链接已复制到剪贴板");
    });






    //post点赞数量和评论数量区域
    const postLikeCommentDiv = document.createElement("div");
    postLikeCommentDiv.classList.add("flex", "w-full", "border-t", "border-gray-100", "dark:border-gray-600");
    const postLikeTemp = `
    <div class="mt-3 mx-5 w-full flex justify-start text-xs">
        <div class="flex text-gray-700 dark:text-gray-200 rounded-md mb-2 mr-4 items-center">
            喜欢：
            <div postLike=${postInfo.post_id} class="ml-1 text-gray-400  text-ms">${postInfo.total_likes}</div>
        </div>
    </div>
    `;
    const postCommentTemp = `
    <div } class="mt-3 mx-5 w-full flex justify-end text-xs">
        <div class="flex text-gray-700 dark:text-gray-200 rounded-md mb-2 mr-4 items-center">
            评论：
            <div postComment=${postInfo.post_id} id="post_comments_number" class="ml-1 text-gray-400 text-ms">${postInfo.total_comments}</div>
        </div>
    </div>
    `;
    postLikeCommentDiv.innerHTML = postLikeTemp + postCommentTemp;




    postTopPostLocationTimeDiv.appendChild(postTopPostLocationDiv);
    postTopPostLocationTimeDiv.appendChild(postTopPostTimeDiv);
    postTopUserDiv.appendChild(postTopPostUserNameDiv);
    postTopImageDiv.appendChild(postTopImage);
    postTopUserDiv.appendChild(postTopPostLocationTimeDiv);

    postTopDiv.appendChild(postTopImageDiv);
    postTopDiv.appendChild(postTopUserDiv);


    //帖子设置的显示
    if (getCookieValue("uid") === postInfo.author) {
        postTopDiv.appendChild(postTopSettingDiv);
        postTopDiv.appendChild(postTopSettingDropdownDiv);
    }
    
    outterDiv.appendChild(postTopDiv);
    outterDiv.appendChild(postTopPostBorder);
    if (postInfo.total_images !== 0) {
        outterDiv.appendChild(postImageDiv);
    }
    outterDiv.appendChild(postContentDiv);
    outterDiv.appendChild(postLikeShareDiv);
    outterDiv.appendChild(postLikeCommentDiv);

    //帖子评论区域

    if (postInfo.total_comments !== 0) {
        for (let i = 0; i < postInfo.total_comments; i++) {
            const postCommentDiv = document.createElement("div");
            postCommentDiv.classList.add("text-black", "p-4", "antialiased", "flex");
            const postCommentAuthorImg = document.createElement("img");
            postCommentAuthorImg.classList.add("rounded-full", "h-8", "w-8", "mr-2", "mt-1", "cursor-pointer","border-green-300","border-2");
            postCommentAuthorImg.setAttribute("src", postInfo.comments[i].avatar);
            postCommentAuthorImg.setAttribute("loading", "lazy");
            postCommentAuthorImg.setAttribute("alt", postInfo.comments[i].username);
            postCommentAuthorImg.onclick = async function () {
                window.open(`/user/?id=${postInfo.comments[i].id}`);
            }
    
            const postCommentContentDiv = document.createElement("div");
            postCommentContentDiv.classList.add("w-full");
            postCommentContentDiv.setAttribute("comment-id", postInfo.comments[i].comment_id);

            //评论顶栏
            const commentContentInnerDIV = document.createElement("div");
            commentContentInnerDIV.classList.add("bg-gray-100", "dark:bg-gray-600", "rounded-lg", "px-4", "pt-2", "pb-2.5");

            const commentTopBanner = document.createElement("div");
            commentTopBanner.classList.add("flex", "justify-between", "mt-1");

            const commentAuthorName = document.createElement("div");
            commentAuthorName.classList.add("flex", "font-semibold", "text-gray-700", "dark:text-white", "text-lg", "leading-relaxed");
            commentAuthorName.innerHTML = postInfo.comments[i].username;

            if (postInfo.comments[i].verification !== 0) {

                const verificationDiv = document.createElement("div");
                verificationDiv.classList.add('ml-2', 'justify-center', 'items-center', 'flex')
        
                const imageElement = document.createElement("img");
                imageElement.classList.add('h-4', 'w-4');
        
                switch (postInfo.comments[i].verification) {
                    case 1:
                        // 个人认证账户
                        imageElement.src = personalAccount;
                        break;
                    case 2:
                        // 企业认证账户
                        imageElement.src = companyAccount;
                        break;
                    case 3:
                        // 政府认证账户
                        imageElement.src = governmentAccount;
                        break;
                    case 4:
                        // 组织认证账户
                        imageElement.src = organizationAccount;
                        break;
                    case 5:
                        // insmont 官方认证账户
                        imageElement.src = insmontAccount;
                        break;
                }
                verificationDiv.appendChild(imageElement);
                commentAuthorName.appendChild(verificationDiv);
            }

            //评论删除按钮
            const commentDeleteSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            commentDeleteSVG.classList.add("w-8", "h-8", "text-gray-400", "hover:text-gray-500", "dark:text-white", "dark:hover:text-gray-400", "cursor-pointer", "justify-end", "items-center", "ml-5");
            commentDeleteSVG.setAttribute("deleteComment", postInfo.comments[i].comment_id);
            commentDeleteSVG.setAttribute("viewBox", "0 0 16 16");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            path.setAttribute("fill", "currentColor");
            path.setAttribute("d", "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z");

            commentDeleteSVG.appendChild(path);

            commentTopBanner.appendChild(commentAuthorName);
            if(getCookieValue("uid") == postInfo.comments[i].id || getCookieValue("uid") == postInfo.author){
                commentTopBanner.appendChild(commentDeleteSVG);
            }

            commentDeleteSVG.onclick = async function () {
                const response = await deleteComment(postInfo.comments[i].comment_id);
                if (response === 200) {
                    postCommentDiv.remove();
                    const postComment = document.querySelector(`div[postComment="${postInfo.post_id}"]`);
                    const currentComments = parseInt(postComment.innerHTML);
                    postComment.innerHTML = (currentComments - 1).toString();
                } else if (response === 401) {
                    showDialog("401", "已经删除了，但是你怎么能看到这条报错的？");
                }
            }

            commentContentInnerDIV.appendChild(commentTopBanner);

            //评论内容
            const commentContentDiv = document.createElement("div");
            commentContentDiv.classList.add("mt-2", "text-base", "font-thin", "overflow-x-auto", "dark:text-white", "leading-snug", "md:leading-normal");
            commentContentDiv.textContent = postInfo.comments[i].content;

            const commentDetailsDiv = document.createElement("div");
            commentDetailsDiv.classList.add("mt-3", "flex", "text-gray-400", "dark:text-white", "text-xs", "justify-between");

            const ipLocationSpan = document.createElement("span");
            ipLocationSpan.innerHTML = `IP&nbsp;属地:&nbsp;<span>${postInfo.comments[i].location}</span>`;

            const commentTimeSpan = document.createElement("span");
            commentTimeSpan.textContent = calculatorTime(postInfo.comments[i].datetime);

            commentDetailsDiv.appendChild(ipLocationSpan);
            commentDetailsDiv.appendChild(commentTimeSpan);

            commentContentInnerDIV.appendChild(commentContentDiv);
            commentContentInnerDIV.appendChild(commentDetailsDiv);

            postCommentContentDiv.appendChild(commentContentInnerDIV);

            postCommentDiv.appendChild(postCommentAuthorImg);
            postCommentDiv.appendChild(postCommentContentDiv);

            outterDiv.appendChild(postCommentDiv);
        }

    }

    async function addCommentListAfterPost(){

        const userInfo = await getUserInfo(getCookieValue("uid"));
        const recentlyCommentId:string = await getRecentlyPostCommentId();

        const postCommentDiv = document.createElement("div");
        postCommentDiv.classList.add("text-black", "p-4", "antialiased", "flex");
        const postCommentAuthorImg = document.createElement("img");
        postCommentAuthorImg.classList.add("rounded-full", "h-8", "w-8", "mr-2", "mt-1", "cursor-pointer", "border-green-300", "border-2");
        postCommentAuthorImg.setAttribute("src", userInfo.avatar);
        postCommentAuthorImg.setAttribute("loading", "lazy");
        postCommentAuthorImg.setAttribute("alt", userInfo.username);
        postCommentAuthorImg.onclick = async function () {
            window.open(`/user/?id=${getCookieValue("uid")}`);
        }

        const postCommentContentDiv = document.createElement("div");
        postCommentContentDiv.classList.add("w-full");

        //评论顶栏
        const commentContentInnerDIV = document.createElement("div");
        commentContentInnerDIV.classList.add("bg-gray-100", "dark:bg-gray-600", "rounded-lg", "px-4", "pt-2", "pb-2.5");

        const commentTopBanner = document.createElement("div");
        commentTopBanner.classList.add("flex", "justify-between", "mt-1");

        const commentAuthorName = document.createElement("div");
        commentAuthorName.classList.add("flex", "font-semibold", "text-gray-700", "dark:text-white", "text-lg", "leading-relaxed");
        commentAuthorName.innerHTML = userInfo.username;

        if (userInfo.verification !== 0) {

            const verificationDiv = document.createElement("div");
            verificationDiv.classList.add('ml-2', 'justify-center', 'items-center', 'flex')

            const imageElement = document.createElement("img");
            imageElement.classList.add('h-4', 'w-4');

            switch (userInfo.verification) {
                case 1:
                    // 个人认证账户
                    imageElement.src = personalAccount;
                    break;
                case 2:
                    // 企业认证账户
                    imageElement.src = companyAccount;
                    break;
                case 3:
                    // 政府认证账户
                    imageElement.src = governmentAccount;
                    break;
                case 4:
                    // 组织认证账户
                    imageElement.src = organizationAccount;
                    break;
                case 5:
                    // insmont 官方认证账户
                    imageElement.src = insmontAccount;
                    break;
            }
            verificationDiv.appendChild(imageElement);
            commentAuthorName.appendChild(verificationDiv);
        }

        //评论删除按钮
        const commentDeleteSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        commentDeleteSVG.classList.add("w-8", "h-8", "text-gray-400", "hover:text-gray-500", "dark:text-white", "dark:hover:text-gray-400", "cursor-pointer", "justify-end", "items-center", "ml-5");
        commentDeleteSVG.setAttribute("deleteComment", recentlyCommentId);
        commentDeleteSVG.setAttribute("viewBox", "0 0 16 16");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("fill", "currentColor");
        path.setAttribute("d", "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z");

        commentDeleteSVG.appendChild(path);

        commentTopBanner.appendChild(commentAuthorName);
        commentTopBanner.appendChild(commentDeleteSVG);


        commentDeleteSVG.onclick = async function () {
            const response = await deleteComment(recentlyCommentId);
            if (response === 200) {
                postCommentDiv.remove();
                const postComment = document.querySelector(`div[postComment="${postInfo.post_id}"]`);
                const currentComments = parseInt(postComment.innerHTML);
                postComment.innerHTML = (currentComments - 1).toString();
            } else if (response === 401) {
                showDialog("401", "已经删除了，但是你怎么能看到这条报错的？");
            }
        }

        commentContentInnerDIV.appendChild(commentTopBanner);

        //评论内容
        const commentContentDiv = document.createElement("div");
        commentContentDiv.classList.add("mt-2", "text-base", "font-thin", "overflow-x-auto", "dark:text-white", "leading-snug", "md:leading-normal");
        commentContentDiv.textContent = outPostInputValue;

        outPostInputValue = "";

        const commentDetailsDiv = document.createElement("div");
        commentDetailsDiv.classList.add("mt-3", "flex", "text-gray-400", "dark:text-white", "text-xs", "justify-between");

        const ipLocationSpan = document.createElement("span");
        ipLocationSpan.innerHTML = `IP&nbsp;属地:&nbsp;<span>${userInfo.location}</span>`;

        const commentTimeSpan = document.createElement("span");

        const currentTime = new Date();
        const shanghaiTime = new Date(currentTime.getTime() + 8 * 60 * 60 * 1000); // 加上8小时的毫秒数
        const formattedTime = calculatorTime(shanghaiTime.toISOString().slice(0, 19).replace('T', ' '));
        commentTimeSpan.textContent = formattedTime;


        commentDetailsDiv.appendChild(ipLocationSpan);
        commentDetailsDiv.appendChild(commentTimeSpan);

        commentContentInnerDIV.appendChild(commentContentDiv);
        commentContentInnerDIV.appendChild(commentDetailsDiv);

        postCommentContentDiv.appendChild(commentContentInnerDIV);

        postCommentDiv.appendChild(postCommentAuthorImg);
        postCommentDiv.appendChild(postCommentContentDiv);


        const postBottomDiv = document.querySelector(`div[postBottom="${postInfo.post_id}"]`);

        // 将 postCommentDiv 插入到 postBottom 元素之前
        postBottomDiv?.before(postCommentDiv);

        // 如果 postBottomDiv 存在，则将其移除并重新插入到 outterDiv 中
        if (postBottomDiv) {
            outterDiv.removeChild(postBottomDiv);
            outterDiv.appendChild(postBottomDiv);
        }
    }

    
    if (postInfo.comment_permission == 1 || postInfo.author == getCookieValue("uid")) {
        const postSendContent = document.createElement("div");
        postSendContent.classList.add("relative", "flex", "items-center", "self-center", "w-full", "p-4", "overflow-hidden", "text-gray-600", "focus-within:text-gray-400");
        postSendContent.setAttribute("postBottom", postInfo.post_id);
        const posterImg = document.createElement("img");
        posterImg.classList.add("border-green-300", "border-2", "w-10", "h-10", "object-cover", "rounded-full", "shadow", "mr-2", "cursor-pointer");
        const userinfo = await getUserInfo(getCookieValue("uid"));
        posterImg.setAttribute("src", userinfo.avatar);
        posterImg.setAttribute("alt", userinfo.username);
        posterImg.setAttribute("loading", "lazy");
        posterImg.onclick = async function () {
            window.open(`/user/?id=${getCookieValue("uid")}`);
        }

        const postSendSPAN = document.createElement("span");
        postSendSPAN.classList.add("absolute", "inset-y-0", "right-0", "flex", "items-center", "pr-6");
        const postButton = document.createElement("button");
        postButton.classList.add("p-1", "focus:outline-none", "focus:shadow-none", "hover:text-blue-500");
        postButton.innerHTML = `
        <svg class="w-6 h-6 transition ease-out duration-300 hover:text-blue-500 text-gray-400" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"></path>
        </svg>
        `;
        postSendSPAN.appendChild(postButton);

        const postInput = document.createElement("input");

        postInput.classList.add("w-full", "py-2", "pl-4", "pr-10", "text-sm", "bg-gray-100", "dark:bg-gray-500", "dark:text-gray-200", "border", "border-transparent", "appearance-none", "rounded-full", "placeholder-gray-400");
        postInput.setAttribute("type", "text");
        postInput.setAttribute("placeholder", "评论一下吧");
        postInput.setAttribute("postCommentInput", postInfo.post_id);

        postSendContent.appendChild(posterImg);
        postSendContent.appendChild(postSendSPAN);
        postSendContent.appendChild(postInput);

        outterDiv.appendChild(postSendContent);

        postButton.onclick = async function () {
        
            if (postInput.value.length !== 0) {
                await doPostComment(postInfo.post_id);
                postInput.value = "";
                const postCommentNumber = document.querySelector(`div[postComment="${postInfo.post_id}"]`);
                const currentComments = parseInt(postCommentNumber.innerHTML);
                postCommentNumber.innerHTML = (currentComments + 1).toString();
                
                await addCommentListAfterPost();

            }
        }
    }else{
        const noAuthDiv = document.createElement("div");
        noAuthDiv.classList.add("text-black", "p-4", "antialiased", "flex", "justify-center", "text-gray-400", "dark:text-white", "text-xs", "dark:text-gray-200","dark:bg-gray-600");
        noAuthDiv.innerHTML = "评论已关闭";
        outterDiv.appendChild(noAuthDiv);
    }

    if(postInfo.visibility == 'true' || getCookieValue("uid") == postInfo.author){
        postList.appendChild(outterDiv);
    }else{
        postList.appendChild(noAuthDiv);
    }
    
}

async function getRecentlyPostCommentId(){

    const cookieid = getCookieValue("uid");
    const post_id = getPostIdFromUrl();

    try {
        const response = await axios.get("http://localhost:2077/v1/post/comment/recently", {
            params: {
                id: cookieid,
                post_id: post_id
            },
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return response.data.message;
        } else if (response.data.code === 400) {
            showDialog("空值", "请检查API调用问题");
        } else if (response.data.code === 403) {
            showDialog("评论没找到", "请检查评论是否存在");
        }else if (response.data.code === 404) {
            showDialog("帖子或用户没找到", "请检查帖子或用户是否存在");
        }else{
            showDialog("网络超时", "请检查网络连接是否正常");
        }

    } catch (error) {
        console.log(error);
    }
}

let outPostInputValue = "";

async function doPostComment(postId:string){
    const cookieid = getCookieValue("uid");
    const postid = postId;
    const input = document.querySelector(`input[postCommentInput="${postId}"]`) as HTMLInputElement;
    const comment_content = input.value;
    outPostInputValue = comment_content;

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("post_id", postid);
    requestData.append("content", comment_content);

    try {
        const response = await axios.post("http://localhost:2077/v1/post/comment", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 400) {
            showDialog("空值", "请检查API调用问题");
        } else if (response.data.code === 401) {
            showDialog("权限不足", "对不起，您没有权限进行此操作");
        } else if (response.data.code === 404) {
            showDialog("帖子不存在", "请检查帖子是否存在");
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}

async function likePost(postId: string) {
    const cookieid = getCookieValue("uid");
    const postid = postId;

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("post_id", postid);

    try {
        const response = await axios.post("http://localhost:2077/v1/post/like", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 401) {
            return 401;
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}

async function unLikePost(postId: string) {

    const cookieid = getCookieValue("uid");
    const postid = postId;

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("post_id", postid);

    try {
        const response = await axios.delete("http://localhost:2077/v1/post/unlike", {
            data: requestData,
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 401) {
            return 401;
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }

}

async function verifyPostLike(postId: string) {
    const cookieid = getCookieValue("uid");
    const postid = postId;
    const url = "http://localhost:2077/v1/post/like/verify?post_id=" + postid + "&id=" + cookieid;
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        switch (response.data.code) {
            case 200:
                return 200;
            case 201:
                return 201;
            case 400:
                showDialog("空值", "请检查API调用问题");
                return 400;
            case 403:
                showDialog("权限不足", "对不起，您没有权限进行此操作");
                return 403;
            case 404:
                showDialog("帖子不存在", "请检查帖子是否存在");
                return 404;
            default:
                showDialog("未知错误", "请联系管理员");
        }

    } catch (error) {
        console.log(error);
    }
}

async function updatePostPrivacy(post_id:string, visibility:string, comment_permission:number){
    const cookieid = getCookieValue("uid");

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("post_id", post_id);
    requestData.append("visibility", visibility);
    requestData.append("comment_permission", comment_permission.toString());

    try {
        const response = await axios.patch("http://localhost:2077/v1/post/privacy/update", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 401) {
            showDialog("权限不足", "对不起，您没有权限进行此操作");
        } else if (response.data.code === 404) {
            showDialog("帖子不存在", "请检查帖子是否存在");
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}

async function deletePost(postId: string) {
    const cookieid = getCookieValue("uid");
    const postid = postId;

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("post_id", postid);

    try {
        const response = await axios.delete("http://localhost:2077/v1/post/delete", {
            data: requestData,
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 401) {
            showDialog("权限不足", "对不起，您没有权限进行此操作");
        } else if (response.data.code === 404) {
            showDialog("帖子不存在", "请检查帖子是否存在");
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteComment(commentId: string) {
    const cookieid = getCookieValue("uid");
    const commentid = commentId;

    const requestData: FormData = new FormData();
    requestData.append("id", cookieid);
    requestData.append("comment_id", commentid);

    try {
        const response = await axios.delete("http://localhost:2077/v1/post/comment/delete", {
            data: requestData,
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return 200;
        } else if (response.data.code === 400) {
            showDialog("空值", "请检查API调用问题");
        } else if (response.data.code === 401) {
            showDialog("权限不足", "对不起，您没有权限进行此操作");
        } else if (response.data.code === 404) {
            showDialog("评论不存在", "请检查评论是否存在");
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    } catch (error) {
        console.log(error);
    }

}

function calculatorTime(time: string): string {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    const parts = time.split(/[-T:+ ]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);
    const second = parseInt(parts[5], 10);

    const postTime = new Date(year, month, day, hour, minute, second);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - postTime.getTime();

    if (timeDifference < 60000) {
        return "刚刚";
    } else if (timeDifference < 3600000) {
        const minutes = Math.floor(timeDifference / 60000);
        return `${minutes}分钟前`;
    } else if (timeDifference < 86400000) {
        const hours = Math.floor(timeDifference / 3600000);
        return `${hours}小时前`;
    } else if (timeDifference < 604800000) {
        const days = Math.floor(timeDifference / 86400000);
        return `${days}天前`;
    } else if (currentTime.getFullYear() === postTime.getFullYear()) {
        return `${months[month]}${day}日 ${hour}:${minute}`;
    } else {
        return `${year}年${months[month]}${day}日 ${hour}:${minute}`;
    }
}