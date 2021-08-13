$(function() {
    var countdown;
    const count = () => {
        var minute = 2;
        var sec = 60;
        countdown = setInterval(function () {
            sec--;
            $('#countdown').text("(" + ('0'+minute) + " : " + ((sec < 10) ? '0'+sec : sec) + ")");
            if(minute == 0 && sec == 0) {
                clearInterval(countdown);
            }
            if (sec == 00) {
                minute--;
                sec = 60;
            }
        }, 1000);
    }
    var e = false;
    var o = false;
    $('[name=email]').blur(() => {
        if($('[name=email]').val().trim() == '') {
            $('[name=email]').addClass('is-invalid');
            e = false;
        }else {
            $('[name=email]').removeClass('is-invalid');
            e = true;
        }
    })
    $('#send').click(() => {
        if($('[name=email]').val().trim().length > 0) {
            e = true;
        }
        if(e) {
            $.ajax({
                url: '/check-email',
                type: 'post',
                data: {
                    email: $('[name=email]').val()
                },
                success(result) {
                    if(result.r == 'found') {
                        $('#not-found').css({'display': 'none'});
                        $('#username').text(`User: ${result.username}`);
                        $("#found").css({'display': 'block'});
                        clearInterval(countdown);
                        count();
                    }else if(result.r == 'not found') {
                        $('#username').text('');
                        $('#found').css({'display': 'none'})
                        $("#not-found").css({'display': 'block'})
                    }
                }
            })
        }
    })
    $('[name=otp]').blur(() => {
        if($('[name=otp]').val().trim() == '') {
            $('[name=otp]').addClass('is-invalid');
            o = false;
        }else {
            $('[name=otp]').removeClass('is-invalid');
            o = true;
        }
    })
    $('#submit').click(() => {
        if(o) {
            $.ajax({
                url: '/confirm-otp',
                type: 'post',
                data: {
                    otp: $('[name=otp]').val(),
                    email: $('[name=email]').val()
                },
                success(result) {
                    if(result.r == 'match') {
                        $('#username').html('');
                        $('#countdown').text('');
                        $('[name=otp]').val('');
                        $('#otp-status').text('');
                        $('#found').css({'display': 'none'});
                        setTimeout(() => location.href = '/change-password/'+result.id, 700);
                    }else {
                        $('#otp-status').text('OTP is not correct');
                    }
                }
            })
        }
    })
})