import "/node_modules/preline/dist/preline.js";
import axios from "axios";

function getFullYear() {
    return new Date().getFullYear().toString();
}

export function enableDarkMode(){
    if (
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }


    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon') as HTMLElement;
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon') as HTMLElement;

    // Change the icons inside the button based on previous settings
    if (
        localStorage.getItem('color-theme') === 'dark' ||
        (!('color-theme' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
    }

    const themeToggleBtn = document.getElementById('theme-toggle') as HTMLElement;

    themeToggleBtn.addEventListener('click', () => {
        // toggle icons inside button
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // if set via local storage previously
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            // if NOT set via local storage previously
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });
}


// 配置dark mode
document.addEventListener("DOMContentLoaded", function (): void {
    document.getElementById("year").innerHTML = getFullYear();
    enableDarkMode();
})

// 订阅按钮
function subscribe(): void {
    const subscribeButton: HTMLInputElement = document.getElementById("subscribeButton") as HTMLInputElement
    document.getElementById("subscribeButton").classList.add("hidden");
    document.getElementById("loadingButton").classList.remove("hidden");
    const input: HTMLInputElement = document.getElementById("user_email") as HTMLInputElement
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    const formData = new FormData();
    formData.append("email", input.value);
    axios.post("https://api.insmont.org.cn/v1/subscribe", formData, {
        timeout: 5000,
        cancelToken: source.token
    })
        .then(response => {
            if (response.data.code === 200) {
                showSubscribeDialog();
                input.value = ""
                resetButton()
            } else if (response.data.code === 400) {
                showSubscribeDialog();
                input.value = ""
                document.getElementById("hs-subscription-with-image").classList.remove("hidden");
                document.getElementById("topTitle").innerHTML = "订阅失败";
                document.getElementById("contentView").innerHTML = "邮箱地址无效";
            } else if (response.data.code === 401) {
                showSubscribeDialog();
                input.value = ""
                document.getElementById("hs-subscription-with-image").classList.remove("hidden");
                document.getElementById("topTitle").innerHTML = "订阅失败";
                document.getElementById("contentView").innerHTML = "邮箱地址无效";
            } else if (response.data.code === 402) { 
                showSubscribeDialog();
                input.value = ""
                document.getElementById("hs-subscription-with-image").classList.remove("hidden");
                document.getElementById("topTitle").innerHTML = "订阅失败";
                document.getElementById("contentView").innerHTML = "该邮箱已经订阅过了";
            } else if (response.data.code === 403) {
                showSubscribeDialog();
                input.value = ""
                document.getElementById("hs-subscription-with-image").classList.remove("hidden");
                document.getElementById("topTitle").innerHTML = "订阅失败";
                document.getElementById("contentView").innerHTML = "邮箱发送失败";
            } else {
                showSubscribeDialog();
                input.value = ""
                document.getElementById("hs-subscription-with-image").classList.remove("hidden");
                document.getElementById("topTitle").innerHTML = "订阅失败";
                document.getElementById("contentView").innerHTML = "服务器错误";
            }

            document.getElementById("loadingButton").classList.add("hidden");
            document.getElementById("subscribeButton").classList.remove("hidden");

        })
        .catch(error => {
            showSubscribeDialog();
            document.getElementById("topTitle").innerHTML = "订阅失败";
            document.getElementById("contentView").innerHTML = "请检查网络连接或稍后再试";
            document.getElementById("loadingButton").classList.add("hidden");
            document.getElementById("subscribeButton").classList.remove("hidden");
            showFailedDialog();
            input.value = ""
            resetButton()
        });

}

//判断邮箱地址
function isEmail(email: string): boolean {
    const reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    return reg.test(email);
}

// 显示订阅成功dialog
function showSubscribeDialog(): void {
    document.getElementById("hs-subscription-with-image").classList.remove("hidden");
}

function showFailedDialog(): void {
    document.getElementById("hs-subscription-with-image").classList.remove("hidden");
    document.getElementById("topTitle").innerHTML = "订阅失败";
    document.getElementById("contentView").innerHTML = "请检查网络连接或稍后再试";
}

function resetButton():void{
    const subscribeButton: HTMLInputElement = document.getElementById("subscribeButton") as HTMLInputElement
    subscribeButton.classList.add("bg-gray-300");
    subscribeButton.classList.add("dark:bg-slate-500");
    subscribeButton.classList.add("pointer-events-none");
    subscribeButton.classList.remove("bg-indigo-500");
    subscribeButton.classList.remove("hover:bg-indigo-600");
    subscribeButton.classList.remove("focus-visible:ring");
    subscribeButton.classList.remove("active:bg-indigo-700");
    subscribeButton.classList.remove("cursor-pointer");
}

document.addEventListener("DOMContentLoaded", function (): void {

    const subscribeButton: HTMLInputElement = document.getElementById("subscribeButton") as HTMLInputElement
    const emailElement: HTMLInputElement = document.getElementById("user_email") as HTMLInputElement;

    emailElement.addEventListener("input", function () {
        if (emailElement.value !== "" && isEmail(emailElement.value)) {
            subscribeButton.classList.remove("bg-gray-300");
            subscribeButton.classList.remove("dark:bg-slate-500");
            subscribeButton.classList.remove("pointer-events-none");
            subscribeButton.classList.add("bg-indigo-500");
            subscribeButton.classList.add("hover:bg-indigo-600");
            subscribeButton.classList.add("focus-visible:ring");
            subscribeButton.classList.add("active:bg-indigo-700");
            subscribeButton.classList.add("cursor-pointer");
        } else {
            resetButton()
        }
    })

    if ((document.getElementById("subscribeButton") as HTMLInputElement) !== null) {
        subscribeButton.addEventListener("click", function () {
            subscribe()
            return false
        })
    }
})