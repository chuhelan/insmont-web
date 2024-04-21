import "/node_modules/preline/dist/preline.js";
import { enableDarkMode } from "../index";
import axios, { CancelToken } from 'axios';
import * as CryptoJS from 'crypto-js';


const source = axios.CancelToken.source();
const cancelToken: CancelToken = source.token;

const account_input = document.getElementById("registerAccount") as HTMLInputElement;
const password_input = document.getElementById("hs-strong-password-with-indicator-and-hint-in-popover") as HTMLInputElement;
const password_input_repeat = document.getElementById("confirm-password") as HTMLInputElement;
const confirm_insont_proxy = document.getElementById("remember-me") as HTMLInputElement;
const register_button = document.getElementById("registerButton") as HTMLButtonElement;
let temp: string = "";

function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhone(phone: string): boolean {
    return /^1[3456789]\d{9}$/.test(phone);
}

function passwordStrength(password: string): boolean {
    //至少一个大写字母、一个小写字母、一个数字、一个特殊符号，密码长度不少于6位
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\s\S])[A-Za-z\d\s\S]{6,}$/.test(password);
}

function passwordMatch(password: string, password_repeat: string): boolean {
    return password === password_repeat;
}

function getFullYear() {
    return new Date().getFullYear().toString();
}

export function encryptPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64);
}

document.addEventListener("DOMContentLoaded", function (): void {
    document.getElementById("year").innerHTML = getFullYear();
    enableDarkMode();
});

function register() {
    setVerifyDetail();
}

function setVerifyDetail() {
    const verify_account_input = document.getElementById("verifyAccountInput") as HTMLInputElement;
    verify_account_input.value = account_input.value;
    temp = account_input.value;
}

function resetRegisterButton() {
    register_button.classList.remove("pointer-events-none", "bg-gray-300", "text-gray-600", "dark:bg-slate-500", "dark:text-gray-300");
    register_button.classList.add("bg-blue-600", "hover:bg-blue-700", "disabled:opacity-50", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
}

function verifyEnterance(): boolean {

    if (account_input.value === "") {
        showDialog("注意", "请输入邮箱或手机号");
        confirm_insont_proxy.checked = false;
        return false;
    }

    if (!isEmail(account_input.value) && !isPhone(account_input.value)) {
        showDialog("注意", "邮箱或手机号格式不正确");
        confirm_insont_proxy.checked = false;
        return false;
    }

    if (password_input.value === "") {
        showDialog("注意", "请输入密码");
        confirm_insont_proxy.checked = false;
        return false;
    }

    if (password_input_repeat.value === "") {
        showDialog("注意", "请再次输入密码");
        confirm_insont_proxy.checked = false;
        return false;
    }

    if (!passwordStrength(password_input.value)) {
        showDialog("注意", "密码强度不符合要求");
        confirm_insont_proxy.checked = false;
        return false;
    }
    if (!passwordMatch(password_input.value, password_input_repeat.value)) {
        showDialog("注意", "两次密码输入不一致");
        confirm_insont_proxy.checked = false;
        return false;
    }
    return true;
}



const account_warning = document.getElementById("accountWarning") as HTMLDivElement;

document.addEventListener("DOMContentLoaded", function (): void {
    account_input.addEventListener("input", function (): void {
        if (!isEmail(account_input.value) && !isPhone(account_input.value)) {
            account_warning.classList.remove("hidden");
        } else {
            account_warning.classList.add("hidden");
        }
    });

    confirm_insont_proxy.addEventListener("click", function (): void {
        if (confirm_insont_proxy.checked && verifyEnterance()) {
            resetRegisterButton();
        } else {
            register_button.classList.add("pointer-events-none", "bg-gray-300", "text-gray-600", "dark:bg-slate-500", "dark:text-gray-300");
            register_button.classList.remove("bg-blue-600", "hover:bg-blue-700", "disabled:opacity-50", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
        }
    });

    register_button.addEventListener("click", function (): void {
        register();
    });
});

function showDialog(title: string, content: string): void {
    const dialog = document.getElementById("hs-subscription-with-image");
    if (dialog) {
        dialog.classList.remove("hidden");
        document.getElementById("topTitle").innerHTML = title;
        document.getElementById("contentView").innerHTML = content;
    }
}


document.addEventListener("DOMContentLoaded", function (): void {
    const VerifyButton = document.getElementById("VerifyAccountButton") as HTMLButtonElement;
    const code = document.querySelectorAll('[data-hs-pin-input-item]');
    let codeValue: string;

    sendVerificationCode();

    code.forEach((input: HTMLInputElement) => {
        input.addEventListener("keyup", function () {
            const values: string[] = [];
            code.forEach((input: HTMLInputElement) => {
                values.push(input.value);
            });

            codeValue = values.join("");

            if (codeValue.length === 6) {
                passVerifyButton();
            } else {
                falseVerifyButton();
            }
        });
    });

    VerifyButton.addEventListener("click", function () {
        //先验证验证码，再注册 在验证码成功的请求中注册
        // doRegisterApi(temp, encryptPassword(password_input.value));
        verifyCodeRequest(temp, codeValue);
    });
});

function verifyCodeRequest(key: string, code: string): void {
    const formData = new FormData();
    const url = "http://localhost:2077/v1/" + isPhoneVerifyCodeOrMailVerifyCode(key);

    if (isPhone(key)) {
        formData.append("phone", key);
    } else if (isEmail(key)) {
        formData.append("email", key);
    }

    formData.append("code", code);

    axios.post(url, formData, {
        timeout: 10000,
        cancelToken: cancelToken
    })
        .then(response => {
            if (response.data.code === 200) {
                doRegisterApi(temp, encryptPassword(password_input.value));
            } else {
                showDialog("验证失败", "验证码错误，请重新输入");
            }
        }).catch(error => {
            showDialog("验证失败", "请检查网络连接或稍后再试");
        });
}

function doRegisterApi(key: string, password: string): void {
    loadingDialog()
    const formData = new FormData();
    formData.append("key", key);
    formData.append("password", password);

    axios.post("http://localhost:2077/v1/register", formData, {
        timeout: 10000,
        cancelToken: cancelToken
    })
        .then(response => {
            if (response.data.code === 200) {
                cancerLoadingDialog();
                showDialog("注册成功", "正在跳转登录界面");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            } else if (response.data.code === 402) {
                showDialog("注册失败", "账号已存在，请直接登录");
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        })
        .catch(error => {
            showDialog("注册失败", "请检查网络连接或稍后再试");
            window.location.reload();
        });

}

function loadingDialog(): void {
    document.getElementById("loadingDialog").classList.remove("hidden");
}

function cancerLoadingDialog(): void {
    document.getElementById("loadingDialog").classList.add("hidden");
}

function passVerifyButton(): void {
    const VerifyButton = document.getElementById("VerifyAccountButton") as HTMLButtonElement;
    VerifyButton.classList.replace("pointer-events-none", "cursor-pointer");
    VerifyButton.classList.remove("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
    VerifyButton.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
}

function falseVerifyButton(): void {
    const VerifyButton = document.getElementById("VerifyAccountButton") as HTMLButtonElement;
    VerifyButton.classList.replace("cursor-pointer", "pointer-events-none");
    VerifyButton.classList.remove("bg-blue-600", "text-white", "hover:bg-blue-700", "dark:focus:outline-none", "dark:focus:ring-1", "dark:focus:ring-gray-600");
    VerifyButton.classList.add("bg-gray-300", "text-gray-600", "dark:bg-slate-500");
}

function sendVerificationCode(): void {
    const button = document.getElementById('verifyAccountSendCodeButton') as HTMLButtonElement;
    const sendText = document.getElementById('SendCodeText') as HTMLElement;
    const countText = document.getElementById('CountNumber') as HTMLElement;

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

    if (isPhone(temp)) {
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


function isPhoneCodeOrMailCode(key: string): string {
    if (isPhone(key)) {
        return "phoneCode";
    } else if (isEmail(key)) {
        return "mailCode";
    }
    return "";
}

function isPhoneVerifyCodeOrMailVerifyCode(key: string): string {
    if (isPhone(key)) {
        return "phoneVerifyCode";
    } else if (isEmail(key)) {
        return "mailVerifyCode";
    }
    return "";
}