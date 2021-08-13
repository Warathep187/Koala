$(function() {
    let imgInp = document.getElementsByName('slip')[0];
    imgInp.onchange = () => {
        let [file] = imgInp.files;
        if(file) {
            document.getElementById('slip-image').style.display = "block";
            document.getElementById('slip-image').src = URL.createObjectURL(file);
        }
    }
})