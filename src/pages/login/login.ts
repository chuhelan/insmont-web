import { enableDarkMode } from '../index';
import '/node_modules/preline/dist/preline.js';
import axios, { CancelToken } from 'axios';
import * as CryptoJS from 'crypto-js';

const source = axios.CancelToken.source();
const cancelToken: CancelToken = source.token;

function getFullYear(): string {
    return new Date().getFullYear().toString();
}

document.getElementById('year').innerHTML = getFullYear();
document.addEventListener('DOMContentLoaded', (): void => {
    enableDarkMode();
});

function encryptPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64);
}

function showDialog(title: string, content: string): void {
    const dialog = document.getElementById("hs-subscription-with-image");
    if (dialog) {
        dialog.classList.remove("hidden");
        document.getElementById("topTitle").innerHTML = title;
        document.getElementById("contentView").innerHTML = content;
    }
}

function isPhoneNumber(phone: string): boolean {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
}

function isEmail(email: string): boolean {
    const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    return reg.test(email);
}

interface User {
    key: string;
    password: string;
}

function extractTokenAndUid(input: string): { token: string, uid: string } | null {
    const parts = input.split('|');
    if (parts.length === 2) {
        return { token: parts[0].trim(), uid: parts[1].trim() };
    } else {
        return null;
    }
}

function checkLogin(): void {
    const inputKey = document.getElementById("inputKey") as HTMLInputElement;
    const inputPassword = document.getElementById("inputPassword") as HTMLInputElement;

    if (inputKey.value === "") {
        showDialog("请输入您的账号", "账号不能为空");
        resetLoginButton();
        return;
    }

    if (!isPhoneNumber(inputKey.value) && !isEmail(inputKey.value)) {
        showDialog("请输入正确的账号", "账号格式不正确");
        resetLoginButton();
        return;
    }

    if (inputPassword.value === "") {
        showDialog("请输入您的密码", "密码不能为空");
        resetLoginButton();
        return;
    }

    const requestUser: User = {
        key: inputKey.value,
        password: inputPassword.value
    };

    loginRequest(requestUser);
}

function resetLoginButton(): void {
    const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
    const loadingButton = document.getElementById("loadingButton") as HTMLButtonElement;

    loadingButton.classList.add("hidden");
    loginButton.classList.remove("hidden");
}

function doLogin(): void {
    const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
    const loadingButton = document.getElementById("loadingButton") as HTMLButtonElement;

    if (loginButton !== null) {
        loginButton.addEventListener("click", function () {
            loadingButton.classList.remove("hidden");
            loginButton.classList.add("hidden");

            checkLogin();

            return false;
        });
    }
}

let temp: string = "";
function loginRequest(user: User): void {
    const formData = new FormData();
    formData.append("key", user.key);
    formData.append("password", encryptPassword(user.password));

    axios.post("http://localhost:2077/v1/login", formData, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                loadingDialog();
                const cookie: Cookies = {
                    uid: extractTokenAndUid(response.data.data.token).uid,
                    token: extractTokenAndUid(response.data.data.token).token
                };
                writeCookie(cookie);
                window.location.href = "/home";
            } else if (response.data.code === 201) {
                temp = user.key;
                open2faDialog(user.key);
                resetLoginButton();
                resetInputValue();
            } else if (response.data.code === 401) {
                showDialog("登录失败", "账号或密码错误");
                resetLoginButton();
                resetInputValue();
            } else if (response.data.code === 500) {
                showDialog("登录失败", "服务器错误");
                resetLoginButton();
                resetInputValue();
            }
        })
        .catch(error => {
            showDialog("登录失败", "请检查网络连接或稍后再试");
            resetLoginButton();
            resetInputValue();
        });
}

function resetInputValue(): void {
    const inputKey = document.getElementById("inputKey") as HTMLInputElement;
    const inputPassword = document.getElementById("inputPassword") as HTMLInputElement;

    inputKey.value = "";
    inputPassword.value = "";
}

document.addEventListener("DOMContentLoaded", function (): void {
    doLogin();
});

interface Cookies {
    uid: string;
    token: string;
}

function writeCookie(savedCookies: Cookies): void {
    const exp = new Date();
    exp.setTime(exp.getTime() + 14 * 24 * 60 * 60 * 1000);
    document.cookie = `uid=${savedCookies.uid}; expires=${exp.toUTCString()}; path=/`;
    document.cookie = `token=${savedCookies.token}; expires=${exp.toUTCString()}; path=/`;
}

function open2faDialog(key: string): void {
    const twofaDialog = document.getElementById("login2faDialog") as HTMLInputElement;
    twofaDialog.click();
    const twoInput = document.getElementById("2faKey") as HTMLInputElement;
    twoInput.value = key;
}

document.addEventListener("DOMContentLoaded", function (): void {
    const twoFaVerifyButton = document.getElementById("2faVerifyButton") as HTMLButtonElement;
    const twoFaCode = document.querySelectorAll('[data-hs-pin-input-item]');
    let twoFaCodeValue: string;

    sendVerificationCode();

    twoFaCode.forEach((input: HTMLInputElement) => {
        input.addEventListener("keyup", function () {
            const values: string[] = [];
            twoFaCode.forEach((input: HTMLInputElement) => {
                values.push(input.value);
            });

            twoFaCodeValue = values.join("");

            if (twoFaCodeValue.length === 6) {
                pass2FaButton();
            } else {
                false2FaButton();
            }
        });
    });

    twoFaVerifyButton.addEventListener("click", function () {
        verificationAccount(temp, twoFaCodeValue);
    });
});

function isPhoneCodeOrMailCode(key: string): string {
    if (isPhoneNumber(key)) {
        return "phoneCode";
    } else if (isEmail(key)) {
        return "mailCode";
    }
    return "";
}

function sendVerificationCode(): void {
    const button = document.getElementById('2faSendButton') as HTMLButtonElement;
    const sendText = document.getElementById('2faSend') as HTMLElement;
    const countText = document.getElementById('2faCount') as HTMLElement;

    let countdown = 60;
    let intervalId: NodeJS.Timeout;

    button.addEventListener('click', () => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.classList.remove('hover:bg-blue-800');

        keyCodeRequest();

        sendText.classList.add('hidden');
        countText.classList.remove('hidden');
        countText.textContent = countdown.toString();
        intervalId = setInterval(() => {
            countdown--;
            countText.textContent = countdown.toString();
            if (countdown <= 0) {
                clearInterval(intervalId);
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.classList.add('hover:bg-blue-800');
                sendText.classList.remove('hidden');
                countText.classList.add('hidden');
                countdown = 60;
            }
        }, 1000);
    });
}

function keyCodeRequest(): void {
    const formData = new FormData();
    const url = "http://localhost:2077/v1/" + isPhoneCodeOrMailCode(temp);

    if (isPhoneNumber(temp)) {
        formData.append("phone", temp);
    } else if (isEmail(temp)) {
        formData.append("email", temp);
    }

    axios.post(url, formData, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                console.log("发送验证码成功");
            } else if (response.data.code === 403) {
                showDialog("发送失败", "服务器繁忙，请稍后再试！");
            }
        })
        .catch(error => {
            showDialog("发送失败", "请检查网络连接或稍后再试");
        });
}

function verificationAccount(key: string, code: string): void {
    const formData = new FormData();

    formData.append("key", key);
    formData.append("code", code);
    axios.post("http://localhost:2077/v1/login/2fa", formData, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                loadingDialog();
                const cookie: Cookies = {
                    uid: extractTokenAndUid(response.data.data.token).uid,
                    token: extractTokenAndUid(response.data.data.token).token
                };
                writeCookie(cookie);
                window.location.href = "/home";
            } else if (response.data.code >= 400 && response.data.code <= 404) {
                showDialog("请重新尝试", "验证码错误");
                const twoFaCode = document.querySelectorAll('[data-hs-pin-input-item]');
                twoFaCode.forEach((input: HTMLInputElement) => {
                    input.value = "";
                });
                false2FaButton();
            } else if (response.data.code === 500) {
                showDialog("验证失败", "服务器错误");
            }
        })
        .catch(error => {
            showDialog("验证失败", "请检查网络连接或稍后再试");
        });
}

function pass2FaButton(): void {
    const twoFaVerifyButton = document.getElementById("2faVerifyButton") as HTMLButtonElement;
    twoFaVerifyButton.classList.replace("pointer-events-none", "cursor-pointer");
    twoFaVerifyButton.classList.remove("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
    twoFaVerifyButton.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
}

function false2FaButton(): void {
    const twoFaVerifyButton = document.getElementById("2faVerifyButton") as HTMLButtonElement;
    twoFaVerifyButton.classList.replace("cursor-pointer", "pointer-events-none");
    twoFaVerifyButton.classList.remove("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
    twoFaVerifyButton.classList.add("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
}

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

async function cookieVerifyAndJump(): Promise<void> {
    const uid = getCookieValue("uid");
    const token = getCookieValue("token");

    if (uid !== null && token !== null) {
        if (await verifyToken(uid, token)) {
            window.location.href = "/home";
        }
    }
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
            loadingDialog();
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

document.addEventListener("DOMContentLoaded", function (): void {
    cookieVerifyAndJump();
});


document.addEventListener("DOMContentLoaded", function (): void {
    const loginCodeVerifyButton = document.getElementById("loginCodeVerifyButton") as HTMLButtonElement;
    const verificationCodeKey = document.getElementById("verifyCodeInput") as HTMLInputElement;
    const loginWithCodeInput = document.querySelectorAll('[verificationCode]');
    const verifyCodeInput = document.getElementById('verifyCodeInput') as HTMLInputElement;
    let loginCode: string;

    __sendVerificationCode();

    let verflag:boolean = false;
    let loginflag:boolean = false;

    verifyCodeInput.addEventListener('input', () => {
        if ((isEmail(verifyCodeInput.value) || isPhoneNumber(verifyCodeInput.value))) {
            verflag = true;
            if(loginflag){
                passVerButton();
            }
        } else {
            verflag = false;
            falseVerButton();
        }
    });

    loginWithCodeInput.forEach((input: HTMLInputElement) => {
        input.addEventListener("keyup", function () {
            const values: string[] = [];
            loginWithCodeInput.forEach((input: HTMLInputElement) => {
                values.push(input.value);
            });

            loginCode = values.join("");

            if (loginCode.length === 6 ){
                loginflag = true;
                if(verflag){
                    passVerButton();
                }
            } else {
                loginflag = false;
                falseVerButton();
            }
        });
    });

    loginCodeVerifyButton.addEventListener("click", function () {
        verificationAccount(verificationCodeKey.value, loginCode);
    });
});


function __sendVerificationCode(): void {
    const button = document.getElementById('verifyCodeButton') as HTMLButtonElement;
    const sendText = document.getElementById('__2faSend') as HTMLInputElement;
    const countText = document.getElementById('__faCount') as HTMLElement;
    const verifyCodeInput = document.getElementById('verifyCodeInput') as HTMLInputElement;

    let countdown = 60;
    let intervalId: NodeJS.Timeout;

    verifyCodeInput.addEventListener('input', () => {
    
        if (isEmail(verifyCodeInput.value) || isPhoneNumber(verifyCodeInput.value)) {
            button.classList.remove("pointer-events-none", "bg-gray-300", "text-gray-600", "dark:bg-slate-500", "dark:text-gray-300");
            button.classList.add("text-white", "bg-blue-700", "hover:bg-blue-800", "focus:ring-4", "focus:outline-none", "focus:ring-blue-300", "dark:bg-blue-600", "dark:hover:bg-blue-700", "dark:focus:ring-blue-800");
            button.disabled = false;
        } else {
            button.classList.add("pointer-events-none", "bg-gray-300", "text-gray-600", "dark:bg-slate-500", "dark:text-gray-300");
            button.classList.remove("text-white", "bg-blue-700", "hover:bg-blue-800", "focus:ring-4", "focus:outline-none", "focus:ring-blue-300", "dark:bg-blue-600", "dark:hover:bg-blue-700", "dark:focus:ring-blue-800");
            button.disabled = true;
        }
    });

    button.addEventListener('click', () => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.classList.remove('hover:bg-blue-800');
        verifyCodeInput.disabled = true;


        __keyCodeRequest(verifyCodeInput.value);

        sendText.classList.add('hidden');
        countText.classList.remove('hidden');
        countText.textContent = countdown.toString();
        intervalId = setInterval(() => {
            countdown--;
            countText.textContent = countdown.toString();
            if (countdown <= 0) {
                clearInterval(intervalId);
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.classList.add('hover:bg-blue-800');
                sendText.classList.remove('hidden');
                countText.classList.add('hidden');
                verifyCodeInput.disabled = false;
                countdown = 60;
            }
        }, 1000);
    });
}

function __keyCodeRequest(key: string): void {
    const formData = new FormData();
    const url = "http://localhost:2077/v1/" + isPhoneCodeOrMailCode(key);

    if (isPhoneNumber(key)) {
        formData.append("phone", key);
    } else if (isEmail(key)) {
        formData.append("email", key);
    }

    axios.post(url, formData, {
        timeout: 10000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                console.log("发送验证码成功");
            } else if (response.data.code === 403) {
                showDialog("发送失败", "服务器繁忙，请稍后再试！");
            }
        })
        .catch(error => {
            showDialog("发送失败", "请检查网络连接或稍后再试");
        });
}

function passVerButton(): void {
    const twoFaVerifyButton = document.getElementById("loginCodeVerifyButton") as HTMLButtonElement;
    twoFaVerifyButton.classList.replace("pointer-events-none", "cursor-pointer");
    twoFaVerifyButton.classList.remove("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
    twoFaVerifyButton.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
}

function falseVerButton(): void {
    const twoFaVerifyButton = document.getElementById("loginCodeVerifyButton") as HTMLButtonElement;
    twoFaVerifyButton.classList.replace("cursor-pointer", "pointer-events-none");
    twoFaVerifyButton.classList.remove("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
    twoFaVerifyButton.classList.add("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
}