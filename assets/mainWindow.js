const toastr = require("toastr")
const electron = require("electron");
const { ipcRenderer } = electron;

ipcRenderer.on("send:message", (e,phone) => {

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }
  toastr.success('Bildirim', phone + ' mesaj gönderildi.')
});

const messages = document.querySelector("#message");
const phoneList = document.querySelector("#phoneList");
// const photo = document.querySelector("#photo");



document.querySelector("#send").addEventListener("click", () => {
  ipcRenderer.send("newTodo:save", { ref: "main", messages : messages.value, phoneList : phoneList.value });
  messages.value = "";
  phoneList.value = "";
});




