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

function identDocumentUrl(): string {
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    let returnUrl = window.location.href;

    if (broswerId !== null && broswerId.length > 0) {
        return returnUrl;
    } else {
        return returnUrl + "?id=" + cookieid;
    }
}

async function setQRImage() {
    const qrUrl = document.getElementById("qrcodeUrl");
    const qrImage = document.getElementById("qrcodePicture") as HTMLImageElement;

    let url = identDocumentUrl();
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

const followButton = document.getElementById("FollowButton");
const unFollowButton = document.getElementById("UnFollowButton");
const followersNumber = document.getElementById("userFans");

async function showFollowUnFollowButton(){
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

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

followButton.addEventListener("click", () => {
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    if(cookieid !== broswerId && broswerId !== null && broswerId.length > 0){
        follow(cookieid, broswerId);
    }
});

unFollowButton.addEventListener("click", () => {
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    if(cookieid !== broswerId && broswerId !== null && broswerId.length > 0){
        unfollow(cookieid, broswerId);
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
    const cookieid = getCookieValue("uid");
    const broswerId = getUserIdFromUrl();

    const cookieUserInfo = await getUserInfo(cookieid);
    const broswerUserInfo = await getUserInfo(broswerId);

    if (broswerId !== null && broswerId.length > 0) {
        document.title = "insmont | " + broswerUserInfo.username;
    } else {
        document.title = "insmont | " + cookieUserInfo.username;
    }

    setTopBannerInfo();
    setLeftCardInfo(CookieOrBroswerIdSelecter());
    setFollowingList();
    setQRImage();
    showFollowUnFollowButton();
}

document.getElementById('year').innerHTML = getFullYear();
document.addEventListener('DOMContentLoaded', (): void => {
    setTimeout(() => {
        setHTMLInfo();
    }, 0);
});

