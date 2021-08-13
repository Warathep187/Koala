$(function() {
    let imgInp = document.getElementsByName('image')[0];
    imgInp.onchange = () => {
        let [file] = imgInp.files;
        if(file) {
            document.getElementById('review-image').style.display = "block";
            document.getElementById('review-image').src = URL.createObjectURL(file);
        }
    }
    $('#star-1').click(() => {
        for(let i=1; i<2; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star.png');
        }
        for(let i=2; i<6; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star-space.png');
        }
        $('[name=points]').val(1);
    })
    $('#star-2').click(() => {
        for(let i=1; i<3; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star.png');
        }
        for(let i=3; i<6; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star-space.png');
        }
        $('[name=points]').val(2);
    })
    $('#star-3').click(() => {
        for(let i=1; i<4; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star.png');
        }
        for(let i=4; i<6; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star-space.png');
        }
        $('[name=points]').val(3);
    })
    $('#star-4').click(() => {
        for(let i=1; i<5; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star.png');
        }
        for(let i=5; i<6; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star-space.png');
        }
        $('[name=points]').val(4);
    })
    $('#star-5').click(() => {
        for(let i=1; i<6; i++) {
            $(`#star-${i}`).attr('src', '/another-images/star.png');
        }
        $('[name=points]').val(5);
    })
})