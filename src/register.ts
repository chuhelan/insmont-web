import "/node_modules/preline/dist/preline.js";
import {enableDarkMode} from "./index";

function getFullYear() {
    return new Date().getFullYear().toString();
}

document.addEventListener("DOMContentLoaded", function (): void {
    document.getElementById("year").innerHTML = getFullYear();
    enableDarkMode();
});