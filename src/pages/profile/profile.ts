import { enableDarkMode } from '../index';
import axios, { all, CancelToken } from 'axios';
import "/node_modules/preline/dist/preline.js";
import { Input } from 'terser-webpack-plugin';
import { encryptPassword } from '../register/register'

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

function ifLogin(){
    const uid = getCookieValue("uid");
    const token = getCookieValue("token");

    verifyToken(uid, token).then((result) => {
        if(result === false){
            showDialog("未登录", "请先登录账户");
        }
    });
}

document.addEventListener('DOMContentLoaded', (): void => {
    ifLogin();
});

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

const checked = 'checked';
const unchecked = ''; 

const userBio = document.getElementById("bio") as HTMLInputElement;
const userName = document.getElementById("UserName") as HTMLInputElement;
const allowedSearched = document.getElementById("allowedSearched") as HTMLInputElement;
const allowedRemcommed = document.getElementById("allowedRemcommed") as HTMLInputElement;


const nan  = document.getElementById("nan_input") as HTMLInputElement;
const nv = document.getElementById("nv_input") as HTMLInputElement;
const wu = document.getElementById("wu_input") as HTMLInputElement;

const birthday = document.getElementById("birthday") as HTMLInputElement;
const constellation = document.getElementById("constellation") as HTMLSelectElement;

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

    document.getElementById("changeLoadingAvatarPicture").classList.add("hidden");
    document.getElementById("changeAvatarPicture").classList.remove("hidden");
    document.getElementById("changeAvatarPicture").setAttribute("src", response.data.data.avatar);

    allowedSearched.checked = response.data.data.search === 'true';
    allowedRemcommed.checked = response.data.data.recommend === 'true';

    if(response.data.data.birthday === null || response.data.data.birthday === "") {
        birthday.value = "";
    }else{
        const dateString = new Date(response.data.data.birthday);
        const date = new Date(dateString);
        const utcDate = new Date(date.toUTCString());
        const formattedDate = utcDate.toISOString().split('T')[0];
        birthday.value = formattedDate;
    }

    if ( response.data.data.constellation !== "") {
        constellation.value = response.data.data.constellation;
    }else if(response.data.data.constellation === null || response.data.data.constellation === ""){
        constellation.value = '选择您的星座';
    }else{
        constellation.value = '选择您的星座';
    }

    userBio.value = response.data.data.bio;
    userName.value = response.data.data.username;

    

    document.getElementById("userLoadingBio").classList.add("hidden");
    if (response.data.data.bio !== null) {
        document.getElementById("userBio").classList.remove("hidden");
        document.getElementById("userBio").innerHTML = response.data.data.bio;
    }


    switch (response.data.data.gender) {
        case "男": {
            document.getElementById("genderNan").classList.remove("hidden");
            nan.checked = true;
            break;
        }

        case "女": {
            document.getElementById("genderNv").classList.remove("hidden");
            nv.checked = true;
            break;
        }
        case "购物袋": {
            document.getElementById("genderWu").classList.remove("hidden"); 
            wu.checked = true;
            break;
        }
        case "": {
            break;
        }
    }


    const verificationCode = response.data.data.verification;
    setVerificationIcon(verificationCode);
}

const checkbox = document.getElementById("check_personalInfo") as HTMLInputElement;

document.getElementById("update_userinfo_button").addEventListener("click", async () => {
    
    if (checkbox.checked === false) {
        showDialog("注意", "请先同意 insmont 修改个人信息协议");
        return;
    }else{
        updatePersonalInfo();
    }
});


function updatePersonalInfo(){
    
    const uid = getCookieValue("uid");
    const formData = new FormData();


    let gender = "";
    if (nan.checked) {
        gender = "男";
    } else if (nv.checked) {
        gender = "女";
    } else {
        gender = "购物袋";
    }

    if(userName.value === "" || userName.value === null){
        showDialog("更新失败", "用户名不能为空");
        return;
    }

    formData.append("id", uid);
    formData.append("username", userName.value);
    formData.append("gender",gender);

    if(birthday.value === "" || birthday.value === null){
        formData.append("birthday", "");
    }else{
        const Datetime = new Date(birthday.value);
        const isoDatetime = Datetime.toISOString().slice(0, 19);
        formData.append("birthday", isoDatetime);
    }
    
    if(constellation.value === "选择您的星座"){
        formData.append("constellation", "");
    }else{
        formData.append("constellation", constellation.value);
    }

    axios.patch("http://localhost:2077/v1/user/info/update", formData, {
        timeout: 10000,
        cancelToken: source.token
    })

    .then(response => {
        if (response.data.code === 200) {
            showDialog("更新成功", "个人信息已更新");
            getUserInfo();
            checkbox.checked = false;
        }else{
            showDialog("更新失败", "请检查网络连接是否正常");
        }
    })
}

const inputElement = document.getElementById("user_image_input") as HTMLInputElement;
const imageElement = document.getElementById("changeAvatarPicture") as HTMLImageElement;
let previewAvatarImage: File | null = null;

inputElement.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
        previewAvatarImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                imageElement.src = e.target.result as string;
                imageElement.classList.remove("hidden");
            }
        };
        reader.readAsDataURL(file);
    }
});


document.getElementById("updateAvatarPictureButton").addEventListener("click", async () => {

    const checkbox = document.getElementById("AvatarImageCheckBox") as HTMLInputElement;

    if (checkbox.checked === false) {
        showDialog("注意", "请先同意 insmont 上传头像协议");
        return;
    }

    if (previewAvatarImage) {
        const formData = new FormData();
        formData.append("id", getCookieValue("uid"));
        formData.append("avatar", previewAvatarImage);

        try {
            const response = await axios.patch("http://localhost:2077/v1/user/avatar/update", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.code === 200) {
                showDialog("更新成功", "头像已更新");
                getUserInfo();
                checkbox.checked = false;
            } else {
                showDialog("更新失败", "请检查网络连接是否正常");
            }
        } catch (error) {
            showDialog("更新失败", "请检查网络连接是否正常");
        }
    }
});

async function getCurrentInfo() {
    const url = "http://localhost:2077/v1/user/info?id=" + getCookieValue("uid");

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            cancelToken: source.token
        });

        if (response.data.code === 200) {
            return response.data;
        } else if (response.data.code === 403) {
            showDialog("网络超时", "请检查网络连接是否正常");
            throw new Error("网络超时");
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

document.getElementById("updateBioButton").addEventListener("click", async () => {
    const bioInput = document.getElementById("bio") as HTMLInputElement;
    const bio: string = bioInput.value;

    try {
        const response = await getCurrentInfo();

        if (response && response.data && bio.trim() === response.data.bio.trim()) {
            showDialog("更新失败", "虽然你没修改内容，但是我还是弹窗假装告诉你已经更新了");
            return;
        }

        if (bio.length > 100) {
            showDialog("更新失败", "个人简介长度超过限制");
            return;
        }
        await updateUserBio(bio); 
    } catch (error) {
        console.error(error);
    }
});

async function updateUserBio(bio:string){
    const uid = getCookieValue("uid");
    const formData = new FormData();

    formData.append("id", uid);
    formData.append("bio", bio);

    await axios.patch("http://localhost:2077/v1/user/bio/update", formData,{
        timeout: 10000,
        cancelToken: source.token
    })
    .then(response => {
        if (response.data.code === 200) {
            showDialog("更新成功", "个人简介已更新");
            getUserInfo();
        }else{
            showDialog("更新失败", "请检查网络连接是否正常");
        }
    })
}

document.getElementById("updatePrivacyButton").addEventListener("click", async () => {
    const allowedSearched = document.getElementById("allowedSearched") as HTMLInputElement;
    const allowedRemcommed = document.getElementById("allowedRemcommed") as HTMLInputElement;
    const search = allowedSearched.checked ? "true" : "false";
    const recommend = allowedRemcommed.checked ? "true" : "false";

    try {
        const response = await getCurrentInfo();

        if (response && response.data && search === response.data.search && recommend === response.data.recommend) {
            showDialog("更新失败", "虽然你没修改内容，但是我还是弹窗假装告诉你已经更新了");
            return;
        }

        await updatePrivacyInfo(search, recommend);
    } catch (error) {
        console.error(error);
    }
});

async function updatePrivacyInfo(search: string, recommend: string){
    const uid = getCookieValue("uid");
    const formData = new FormData();

    formData.append("id", uid);
    formData.append("search", search);
    formData.append("recommend", recommend);

    await axios.put("http://localhost:2077/v1/user/privacy/update", formData, {
        timeout: 10000,
        cancelToken: source.token
    })
    .then(response => {
        if (response.data.code === 200) {
            showDialog("更新成功", "隐私设置已更新");
            getUserInfo();
        }else{
            showDialog("更新失败", "请检查网络连接是否正常");
        }
    })
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
    setTimeout(() => {
        getUserInfo();
    }, 0);
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

    if (event.target === document.getElementById("switchAccount")) {
        signOutAccount();
        window.location.href = "/login";
    }
});

const deleteCheckBox = document.getElementById("delete_account_check") as HTMLInputElement;
const deleteButton = document.getElementById("delete_account_button");

deleteButton.addEventListener("click", async () => {
    if (deleteCheckBox.checked === false) {
        showDialog("注意", "您确定要删除账户吗？");
        return;
    }else if(deleteCheckBox.checked === true){
        deleteAccount();
    }
});

function deleteAccount(){

    loadingDialog();

    const uid = getCookieValue("uid");
    const formData = new FormData();
    formData.append("id", uid);

    axios.delete("http://localhost:2077/v1/user/delete", {
        data: formData,
        timeout: 10000,
        cancelToken: source.token
    })
    .then(response => {
        if (response.data.code === 200) {
            showDialog("删除成功", "账户已删除");
            signOutAccount();
            window.location.href = "/";
        }else{
            showDialog("删除失败", "请检查网络连接是否正常");
        }
    })
}

const birthdayInput = document.getElementById('birthday') as HTMLInputElement;
const today = new Date();
const maxDate = today.toISOString().split('T')[0];
birthdayInput.max = maxDate;

const constellationSelect = document.getElementById('constellation') as HTMLSelectElement;

birthdayInput.addEventListener('change', function () {
    const birthdayDate = new Date(this.value);
    const month = birthdayDate.getMonth() + 1;
    const day = birthdayDate.getDate();

    let constellation = '';
    if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) {
        constellation = '摩羯座';
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
        constellation = '水瓶座';
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
        constellation = '双鱼座';
    } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
        constellation = '白羊座';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
        constellation = '金牛座';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
        constellation = '双子座';
    } else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
        constellation = '巨蟹座';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
        constellation = '狮子座';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
        constellation = '处女座';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
        constellation = '天秤座';
    } else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
        constellation = '天蝎座';
    } else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
        constellation = '射手座';
    }

    constellationSelect.value = constellation;
});

function passwordStrength(password: string): boolean {
    //至少一个大写字母、一个小写字母、一个数字、一个特殊符号，密码长度不少于6位
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\s\S])[A-Za-z\d\s\S]{6,}$/.test(password);
}

function passwordMatch(password: string, password_repeat: string): boolean {
    return password === password_repeat;
}

document.getElementById("updatePasswordButton").addEventListener("click", async () => {

    const firstPasswordInput = document.getElementById("password") as HTMLInputElement;
    const secondPasswordInput = document.getElementById("repeatPassword") as HTMLInputElement;
    const checkbox = document.getElementById("password_checkbox") as HTMLInputElement;

    const firstPassword = firstPasswordInput.value;
    const secondPassword = secondPasswordInput.value;

    if(checkbox.checked === false){
        showDialog("注意", "请先同意 insmont 修改密码协议");
        return;
    }

    if (firstPassword === null || firstPassword.length === 0 || secondPassword === null || secondPassword.length === 0) {
        showDialog("更新失败", "密码不能为空");
        return;
    }

    if(!passwordStrength(firstPassword)){
        showDialog("更新失败", "密码强度不符合要求");
        return;
    }

    if(!passwordMatch(firstPassword, secondPassword)){
        showDialog("更新失败", "两次输入密码不一致");
        return;
    }

    const uid = getCookieValue("uid");
    const password = encryptPassword(firstPassword);

    const formData = new FormData();
    formData.append("id", uid);
    formData.append("password", password);

    await axios.post("http://localhost:2077/v1/user/password/update", formData, {
        timeout: 10000,
        cancelToken: source.token
    })
    .then(response => {
        if (response.data.code === 200) {
            showDialog("更新成功", "密码已更新");
            signOutAccount();
            window.location.href = "/login";
        }else{
            showDialog("更新失败", "请检查网络连接是否正常");
        }
    })

});


document.getElementById("topDropDownButton").addEventListener("click", function() {
    var dropdown = document.getElementById("topDropDownButton");

    // 切换显示/隐藏下拉菜单
    if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
        dropdown.classList.add("block");
    } else {
        dropdown.classList.remove("block");
        dropdown.classList.add("hidden");
    }
});


