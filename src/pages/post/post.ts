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



    let url = window.location.origin +"/user/?id=" + userid;
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

async function showFollowUnFollowButton(userid: string){
    const cookieid = getCookieValue("uid");
    const broswerId = userid

    if(cookieid !== broswerId && broswerId !== null && broswerId.length > 0){
        isFollowed(cookieid, broswerId).then((result) => {
            if(result === 1){
                unFollowButton.classList.remove("hidden");
            }else if(result === 0){
                followButton.classList.remove("hidden");
            }
        });
    }
}


followButton.addEventListener("click", async () => {
    const cookieid = getCookieValue("uid");
    const postUserId = await getPostInfo().then((data) => data.author)

    if(cookieid !== postUserId && postUserId !== null && postUserId.length > 0){
        await follow(cookieid, postUserId);
    }
});

unFollowButton.addEventListener("click", async () => {
    const cookieid = getCookieValue("uid");
    const postUserId = await getPostInfo().then((data) => data.author)

    if(cookieid !== postUserId && postUserId !== null && postUserId.length > 0){
        unfollow(cookieid, postUserId);
    }
});


async function follow(follower: string, following: string) {
    const requestData:FormData = new FormData();
    requestData.append("follower", follower);
    requestData.append("following", following);

    try{
        const response = await axios.post("http://localhost:2077/v1/follow", requestData, {
            timeout: 10000,
            cancelToken: source.token
        });

        if(response.data.code === 200){
            followButton.classList.add("hidden");
            unFollowButton.classList.remove("hidden");
            followersNumber.innerHTML = (parseInt(followersNumber.innerHTML) + 1).toString();
        }else{
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    }catch(error){
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
        }else{
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
        }else{
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
    img.classList.add("h-12", "w-12", "rounded-full","cursor-pointer");
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

function getPostIdFromUrl(): string | null{
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
function showImageDialog(imageURL: string){
    imageDialog.classList.remove("hidden");
    imageDialogImage.src = imageURL;
}

document.getElementById("closeImageDialog").addEventListener("click", function(){
    imageDialog.classList.add("hidden");
});

async function setPostInfo() {

    const postInfo = await getPostInfo();

    const postList = document.getElementById("postList");

    //post最外层div
    const outterDiv = document.createElement("div");
    outterDiv.classList.add("bg-white", "shadow", "rounded-lg", "mb-6", "dark:bg-slate-900");
    outterDiv.setAttribute("post-id", postInfo.post_id);

    //post顶栏
    const postTopDiv = document.createElement("div");
    postTopDiv.classList.add("flex", "flex-row", "px-2", "py-3", "mx-3", "hs-dropdown", "relative");
    const postTopImageDiv = document.createElement("div");
    postTopImageDiv.classList.add("w-auto", "h-auto", "rounded-full");
    // post设置权限
    const postTopSettingDiv = document.createElement("div");
    postTopDiv.setAttribute("id", "SettingDiv");
    postTopSettingDiv.classList.add("hs-dropdown-toggle", "inline-flex", "ml-auto", "flex", "cursor-pointer","justify-end", "text-gray-400", "dark:text-gray-200", "items-center");
    const svginfo = `
    <svg class="text-gray-600 dark:text-white h-6 w-6 justify-center items-center" data-slot="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
    </svg>
    `;
    postTopSettingDiv.innerHTML = svginfo;

    const dropdownDiv  = `
    <div dropdown-post-id="${postInfo.post_id}" aria-labelledby="SettingDiv"
        class="hidden z-10 border-blue-500 dark:border-white bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-72 dark:bg-gray-700 dark:divide-gray-600
        hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0">
        <ul class="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownToggleButton">
            <li>
                <div class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                    <label class="inline-flex items-center w-full cursor-pointer">
                        <input postPublic="${postInfo.post_id}" type="checkbox" value="" class="sr-only peer">
                        <div
                            class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600">
                        </div>
                        <span class="ml-3 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            公开该帖子
                        </span>
                    </label>
                </div>
            </li>
            <li>
                <div class="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                    <label class="inline-flex items-center w-full cursor-pointer">
                        <input postComment="${postInfo.post_id}" type="checkbox" value="" class="sr-only peer">
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
    </div>
    `;

    postTopDiv.innerHTML = dropdownDiv;


    // post顶栏图片
    const postTopImage = document.createElement("img");
    postTopImage.classList.add("w-12", "h-12", "rounded-full", "cursor-pointer");
    postTopImage.setAttribute("src", postInfo.author_avatar);
    postTopImage.setAttribute("loading", "lazy");
    postTopImage.setAttribute("alt", postInfo.author);
    postTopImage.setAttribute("onclick", `window.open("/user/?id=${postInfo.author}")`);
    //post顶栏用户区域
    const postTopUserDiv = document.createElement("div");
    postTopUserDiv.classList.add("flex", "flex-col", "mb-2", "ml-4", "mt-1");
    //post顶栏post用户昵称
    const postTopPostUserNameDiv = document.createElement("div");
    postTopPostUserNameDiv.classList.add("text-gray-600", "dark:text-gray-200", "text-sm", "font-semibold","items-center", "flex","cursor-pointer");
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

            postImage.addEventListener("click", function(){
                showImageDialog(postInfo.images[i]);
            });

            postImageDiv.appendChild(postImage);
            postImageControlDiv.appendChild(postImageDiv);
        }
        postImageDiv.appendChild(postImageControlDiv);
    }

    
    //post文字内容
    const postContentDiv = document.createElement("div");
    postContentDiv.classList.add("text-black", "font-bold", "dark:text-gray-200", "text-lg", "mb-6", "mx-3", "px-2");
    if(postInfo.total_images === 0){
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
    
    postUnlikeSpan.classList.add("hidden", "transition", "ease-out", "duration-300", "hover:bg-gray-50", "bg-gray-100", "hover:dark:bg-gray-400", "dark:bg-gray-500", "h-8", "px-2", "py-2", "text-center", "rounded-full", "text-gray-100", "cursor-pointer");
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
    postLikeSpan.classList.add("hidden", "transition", "ease-out", "duration-300", "hover:bg-gray-50", "bg-gray-100", "hover:dark:bg-gray-400", "dark:bg-gray-500", "h-8", "px-2", "py-2", "text-center", "rounded-full", "text-gray-100", "cursor-pointer");
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




    postTopPostLocationTimeDiv.appendChild(postTopPostLocationDiv);
    postTopPostLocationTimeDiv.appendChild(postTopPostTimeDiv);
    postTopUserDiv.appendChild(postTopPostUserNameDiv);
    postTopImageDiv.appendChild(postTopImage);
    postTopUserDiv.appendChild(postTopPostLocationTimeDiv);

    postTopDiv.appendChild(postTopImageDiv);
    postTopDiv.appendChild(postTopUserDiv);
    if (getCookieValue("uid") === postInfo.author) {
        postTopDiv.appendChild(postTopSettingDiv);
        // await setPostSetting();
    }

    outterDiv.appendChild(postTopDiv);
    outterDiv.appendChild(postTopPostBorder);
    if(postInfo.total_images !== 0){
        outterDiv.appendChild(postImageDiv);
    }
    outterDiv.appendChild(postContentDiv);
    outterDiv.appendChild(postLikeShareDiv);

    postList.appendChild(outterDiv);


    async function setPostSetting() {
        const postPublic = document.querySelector(`input[postPublic="${postInfo.post_id}"]`) as HTMLInputElement;
        const postComment = document.querySelector(`input[postComment="${postInfo.post_id}"]`) as HTMLInputElement;
        const postDelete = document.querySelector(`div[postDelete="${postInfo.post_id}"]`) as HTMLDivElement;
        const postSave = document.querySelector(`div[postSave="${postInfo.post_id}"]`) as HTMLDivElement;

        if (postInfo.visibility === true) {
            postPublic.checked = true;
        } else {
            postPublic.checked = false;
        }

        if (postInfo.comment_permission === 1) {
            postComment.checked = true;
        } else {
            postComment.checked = false;
        }

    }



}


function calculatorTime(time: string): string {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月','9月', '10月', '11月', '12月'];

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