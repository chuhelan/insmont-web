import { enableDarkMode } from '../index';
import axios, { CancelToken } from 'axios';
import "/node_modules/preline/dist/preline.js";

const source = axios.CancelToken.source();
const cancelToken: CancelToken = source.token;

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

async function getUserInfo() {
    const uid = getCookieValue("uid");
    const token = getCookieValue("token");

    if (uid !== null && token !== null) {
        if (await verifyToken(uid, token)) {
            await setDefaultInfo(uid);
            await setUserPostInfo(uid);
        } else {
            showDialog("网络超时", "请检查网络连接是否正常");
        }
    }
}

async function setDefaultInfo(uid: string) {
    await setUserInfo(uid);
}

async function setUserInfo(uid: string) {

    const url = "http://localhost:2077/v1/user/info?id=" + uid;

    const reponse = await axios.get(url, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                setLeftTopProfile(response);
            } else if (response.data.code === 403) {

            }
        })
        .catch(error => {
            console.log(error);
        });
}

function setLeftTopProfile(response: any) {

    document.getElementById("userLoadingPicture").classList.add("hidden");
    document.getElementById("userPicture").classList.remove("hidden");
    document.getElementById("userPicture").setAttribute("src", response.data.data.avatar);

    document.getElementById("userTopLoadingPicture").classList.add("hidden");
    document.getElementById("userTopPicture").classList.remove("hidden");
    document.getElementById("userTopPicture").setAttribute("src", response.data.data.avatar);

    document.getElementById("userLoadingName").classList.add("hidden");
    document.getElementById("username").classList.remove("hidden");
    document.getElementById("username").innerHTML = response.data.data.username;

    document.getElementById("userTopName").innerHTML = response.data.data.username;

    document.getElementById("userLoadingLocation").classList.add("hidden");
    document.getElementById("userLocation").classList.remove("hidden");
    document.getElementById("userLocation").innerHTML = response.data.data.location;

    document.getElementById("topDropDownButton").classList.add("hs-dropdown-menu");

    document.getElementById("userLoadingBio").classList.add("hidden");
    if (response.data.data.bio !== null) {
        document.getElementById("userBio").classList.remove("hidden");
        document.getElementById("userBio").innerHTML = response.data.data.bio;
    }

    switch (response.data.data.gender) {
        case "男": document.getElementById("genderNan").classList.remove("hidden"); break;
        case "女": document.getElementById("genderNv").classList.remove("hidden"); break;
        case "购物袋": document.getElementById("genderWu").classList.remove("hidden"); break;
        case "": break;
    }
    

    const verificationCode = response.data.data.verification;
    setVerificationIcon(verificationCode);
}

function setVerificationIcon(verificationCode: number) {
    const personalAccount = "../assets/personal.svg";
    const companyAccount = "../assets/company.svg";
    const governmentAccount = "../assets/government.svg";
    const organizationAccount = "../assets/organization.svg";
    const insmontAccount = "../assets/official.svg";

    if (verificationCode !== 0) {
        
        const verificationDiv = document.getElementById("userVerification");
        const topVerificationDiv = document.getElementById("userTopVerification");
        verificationDiv.classList.add('justify-center', 'items-center', 'flex')
        topVerificationDiv.classList.add('items-center', 'flex')
        const imageElement = document.createElement("img");
        const topImageElement = document.createElement("img");
        imageElement.classList.add('h-4', 'w-4');
        topImageElement.classList.add('h-4', 'w-4');

        

        switch (verificationCode) {
            case 1:
                // 个人认证账户
                imageElement.src = personalAccount;
                topImageElement.src = personalAccount;
                break;
            case 2:
                // 企业认证账户
                imageElement.src = companyAccount;
                topImageElement.src = companyAccount;
                break;
            case 3:
                // 政府认证账户
                imageElement.src = governmentAccount;
                topImageElement.src = governmentAccount;
                break;
            case 4:
                // 组织认证账户
                imageElement.src = organizationAccount;
                topImageElement.src = organizationAccount;
                break;
            case 5:
                // insmont 官方认证账户
                imageElement.src = insmontAccount;
                topImageElement.src = insmontAccount;
                break;
        }
        verificationDiv.appendChild(imageElement);
        topVerificationDiv.appendChild(topImageElement);
    }
}

async function setUserPostInfo(uid: string) {
    const url = "http://localhost:2077/v1/post/userinfo?id=" + uid;

    const reponse = await axios.get(url, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.id !== null) {
                setPostInfo(response);
            } else {
                showDialog("网络超时", "请检查网络连接是否正常");
            }
        })
        .catch(error => {
            console.log(error);
        });
}

interface UserInfo {
    id: string;
    username: string;
    avatar: string;
}


function setPostInfo(response: any) {

    document.getElementById("userLoadingPost").classList.add("hidden");
    document.getElementById("userPost").classList.remove("hidden");
    document.getElementById("userPost").innerHTML = response.data.tweets;

    document.getElementById("userLoadingFans").classList.add("hidden");
    document.getElementById("userFans").classList.remove("hidden");
    document.getElementById("userFans").innerHTML = response.data.fans;

    document.getElementById("userLoadingFollows").classList.add("hidden");
    document.getElementById("userFollows").classList.remove("hidden");
    document.getElementById("userFollows").innerHTML = response.data.follows;
}


document.getElementById('year').innerHTML = getFullYear();
document.addEventListener('DOMContentLoaded', (): void => {
    getUserInfo();
});


function signOutAccount() {
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document.addEventListener("click", function (event) {
    if (event.target === document.getElementById("signOutAccount")) {
        signOutAccount();
        window.location.href = "/";
    }

    if(event.target === document.getElementById("switchAccount")) {
        signOutAccount();
        window.location.href = "/login";
    }
});

const datetimeInput = document.getElementById('datetime') as HTMLInputElement;
const scheduleBtn = document.getElementById('scheduleBtn');
const closeBtn = document.getElementById('closeBtn');
let apiTime:string = '';

if (scheduleBtn && datetimeInput) {
    scheduleBtn.addEventListener('click', () => {
        if (datetimeInput.value.trim() === '') {
            showDialog("注意", "请选择日期和时间");
            return;
        }

        const selectedDatetime = new Date(datetimeInput.value);
        const currentDatetime = new Date();

        if (selectedDatetime < currentDatetime) {
            showDialog("注意时间", "请重新选择将来的时间");
        } else {
            const chineseDateTime = `${selectedDatetime.getFullYear()}年${(selectedDatetime.getMonth() + 1).toString().padStart(2, '0')}月${selectedDatetime.getDate().toString().padStart(2, '0')}日 ${selectedDatetime.getHours().toString().padStart(2, '0')}时${selectedDatetime.getMinutes().toString().padStart(2, '0')}分`;
            const isoDatetime = selectedDatetime.toISOString().slice(0, 19);
            showDialog("设置成功", "将在 " + chineseDateTime + " 发送");
            apiTime = isoDatetime;
            // 这里可以添加发送逻辑
            closeBtn.click();
        }
    });
}


const postUrlButton = document.getElementById('postUrlButton');
const postLocationButton = document.getElementById('postLocationButton');

if (postUrlButton) {
    postUrlButton.addEventListener('click', () => {
        showDialog("正在火速开发中", "该功能正在测试，敬请期待");
    });
}

if (postLocationButton) {
    postLocationButton.addEventListener('click', () => {
        showDialog("正在火速开发中", "该功能正在测试，敬请期待");
    });
}

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const postImageButton = document.getElementById('postImageButton') as HTMLButtonElement;
const uploadImage:File[] = [];

fileInput.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    const previewContainer = document.getElementById('previewContainer') as HTMLElement;
    if (files && previewContainer) {
        // 清空之前的预览
        previewContainer.innerHTML = '';

        const selectedFiles = Array.from(files).slice(0, 9); // 限制最多只能选择 9 个文件
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            uploadImage.push(file);
            // 换算成KB MB 
            let size = file.size;
            let sizeStr = '';
            if (size < 1024) {
                sizeStr = size + 'B';
            } else if (size < 1024 * 1024) {
                sizeStr = (size / 1024).toFixed(2) + 'KB';
            } else {
                sizeStr = (size / 1024 / 1024).toFixed(2) + 'MB';
            }
            showDialog(file.name, sizeStr);

            // 创建图片预览
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result;
                const previewImageContainer = document.createElement('div');
                previewImageContainer.classList.add('relative', 'group');

                const imageElement = document.createElement('img');
                imageElement.classList.add('w-16', 'h-16', 'rounded-lg', 'max-w-none');

                // 添加蒙版元素
                const overlayElement = document.createElement('div');
                overlayElement.classList.add('absolute', 'inset-0', 'bg-black', 'rounded-lg', 'bg-opacity-50', 'opacity-0', 'transition-opacity', 'duration-300', 'group-hover:opacity-100');

                previewImageContainer.appendChild(imageElement);
                previewImageContainer.appendChild(overlayElement);
                
                imageElement.onload = () => {
                    // 检查 imageElement 是否加载了图像
                    if (imageElement.width > 0 && imageElement.height > 0) {
                        const deleteIcon = document.createElement('svg');
                        deleteIcon.classList.add('w-12', 'h-12', 'cursor-pointer','text-white', 'absolute', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2');
                        deleteIcon.setAttribute('data-slot', 'icon');
                        deleteIcon.setAttribute('viewBox', '0 0 16 16');
                        deleteIcon.setAttribute('stroke', 'currentColor');
                        deleteIcon.setAttribute('fill', 'none');
                        deleteIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        deleteIcon.setAttribute('aria-hidden', 'true');
                        deleteIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                        `;
                        deleteIcon.addEventListener('click', () => {
                            // 处理删除操作
                            previewImageContainer.remove();
                        });
                        previewImageContainer.appendChild(deleteIcon);
                    }
                };
                imageElement.src = imageUrl as string;
                previewContainer.appendChild(previewImageContainer);
            };
            reader.readAsDataURL(file);
        }
    }
});


postImageButton.addEventListener('click', () => {
    fileInput.click();
});

const postButton = document.getElementById('postButton') as HTMLButtonElement;
postButton.addEventListener('click', async () => {

    loadingDialog();

    const textArea = document.getElementById('editor') as HTMLTextAreaElement;
    const allowedPostPublic = document.getElementById('allowedPostPublic') as HTMLInputElement;
    const allowedPostComment = document.getElementById('allowedPostComment') as HTMLInputElement;

    const datetime: string = apiTime;
    let content: string = textArea.value;
    const visibility: string = allowedPostPublic.checked ? 'true' : 'false';
    const comment_permission: number = allowedPostComment.checked ? 1 : 0;
    let images: File[] = uploadImage;
    const id = getCookieValue("uid");

    if (content.trim() === '' && images.length === 0) {
        showDialog("注意", "内容不能为空");
        removeLoadingDialog();
        return;
    }

    // 将文本中的换行符替换为 <br> 标签
    let contentWithLineBreaks = content.replace(/\n/g, '<br>');

    // 如果内容为空，并且上传了图片，则将内容设置为 "分享图片"
    if (contentWithLineBreaks.trim() === '' && images.length !== 0) {
        contentWithLineBreaks = "分享图片";
    }

    if (verifyToken(id, getCookieValue("token"))) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('content', contentWithLineBreaks);
        formData.append('visibility', visibility);
        formData.append('comment_permission', comment_permission.toString());
        formData.append('datetime', datetime);

        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

        const response = await axios.post('http://localhost:2077/v1/post', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            showDialog("发布成功", "您的动态已发布");
            textArea.value = '';
            allowedPostPublic.checked = true;
            allowedPostComment.checked = true;
            fileInput.value = '';
            uploadImage.length = 0;
            document.getElementById('previewContainer').innerHTML = '';
            apiTime = '';
            removeLoadingDialog();
        } else {
            showDialog("发布失败", "请检查网络连接是否正常");
        }
    } else {
        showDialog("登录状态已过期", "请重新登录");
        return;
    }

});



function CookieOrBroswerIdSelecter(): string {
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    if (broswerId !== null && broswerId.length > 0) {
        return broswerId;
    } else {
        return cookieid;
    }
}

function getUserIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    return userId;
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

async function setFollowingList() {
    
    const userId = CookieOrBroswerIdSelecter();
    const userinfo = await showLatestPostLimit5(userId);

    if (userinfo.length === 0) {
        document.getElementById("haventFollowPerson").classList.remove("hidden");
    }

    userinfo.forEach((user: UserInfo) => {
            singleFollowingUser(user);
    });
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

document.addEventListener('DOMContentLoaded', (): void => {
    setFollowingList();
});