$(function() {
    var countdown;
    /* Register */
    let e = false;
    let u = false;
    let p = false;
    let a = false;
    let t = false;
    let c = false;
    let o = false;
    const otpSend = () => {
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
        $.ajax({
            url: '/otp/' + $('[name=register-email]').val(),
            type: 'post',
        })
    }
    const closeOrCancel = () => {
        e = false;
        u = false;
        p = false;
        a = false;
        t = false;
        c = false;
        o = false;
        clearInterval(countdown);
        let listInput = ['email', 'username', 'password', 'confirm', 'address', 'tel', 'captcha', 'otp'];
        for(let i of listInput) {
            $(`[name=register-${i}]`).val('');
            $(`[name=register-${i}]`).removeClass('is-invalid');
        }
        listSpan = ['email', 'username', 'password', 'tel', 'captcha', 'otp'];
        for(let j of listSpan) {
            $(`#${j}-status`).text('');
        }
        clearInterval(countdown);
        $('#countdown').text('');
        $('.otp-input').css({'display': 'none'});
        $('#loading').css({'display': 'none'});
    }
    $('#register-cancel').click(() => closeOrCancel())
    $('#register-close').click(() => closeOrCancel())
    $('#register').click(() => {
        if(e && u && p && a && t && c) {
            if(o == false) {
                $('.otp-input').css({'display': 'block'});
                otpSend();
                return;
            }
            if(e && u && p && a && t && c && o) {
                $.ajax({
                    url: '/register-check/registering',
                    type: 'post',
                    data: {
                        email: $('[name=register-email]').val(),
                        username: $('[name=register-username]').val(),
                        password: $('[name=register-password]').val(),
                        address: $('[name=register-address]').val(),
                        tel: $('[name=register-tel]').val(),
                        otp: $('[name=register-otp]').val()
                    },
                    beforeSend() {
                        $('#loading').css({'display': 'block'});
                    },
                    success(result) {
                        if(result.r == 'Registering successfully') {
                            e = false;
                            u = false;
                            p = false;
                            a = false;
                            t = false;
                            c = false;
                            o = false;
                            setTimeout(() => {
                                swal({
                                    title: result.r,
                                    text: "Let's go to login.",
                                    icon: "success",
                                    button: "OK",
                                }).then(() => {
                                    location.href = "/";
                                });
                            }, 500)
                        }else if(result.r == 'Error') {
                            e = false;
                            u = false;
                            p = false;
                            a = false;
                            t = false;
                            c = false;
                            o = false;
                            setTimeout(() => {
                                swal({
                                    title: "Error",
                                    text: "Please check your information again.",
                                    icon: "error",
                                    button: "OK"
                                }).then(() => location.href = '/')
                            }, 500)
                        }else if(result.r == 'OTP is incorrect') {
                            setTimeout(() => {
                                $('#otp-status').text(result.r);
                            }, 500)
                        }
                    },
                    complete() {
                        setTimeout(() => {
                            $('#loading').css({'display': 'none'});
                        }, 500)
                    }
                })
            }
        }else {
            if($('[name=register-email]').val().trim() == '') {
                $('[name=register-email]').addClass('is-invalid');
                e = false;
            }else {
                $('[name=register-email]').removeClass('is-invalid');
            }
            if($('[name=register-username]').val().trim() == '') {
                $('[name=register-username]').addClass('is-invalid');
                u = false;
            }else {
                $('[name=register-username]').removeClass('is-invalid');
            }
            if($('[name=register-password]').val().trim() == '') {
                $('[name=register-password]').addClass('is-invalid');
                p = false;
            }else {
                $('[name=register-password]').removeClass('is-invalid');
            }
            if($('[name=register-confirm]').val().trim() == '') {
                $('[name=register-confirm]').addClass('is-invalid');
                p = false;
            }else {
                $('[name=register-confirm]').removeClass('is-invalid');
            }
            if($('[name=register-address]').val().trim() == '') {
                $('[name=register-address]').addClass('is-invalid');
                a = false;
            }else {
                $('[name=register-address]').removeClass('is-invalid');
            }
            if($('[name=register-tel]').val().trim() == '') {
                $('[name=register-tel]').addClass('is-invalid');
                t = false;
            }else {
                $('[name=register-tel]').removeClass('is-invalid');
            }if($('[name=register-captcha]').val().trim() == '') {
                $('[name=register-captcha]').addClass('is-invalid');
                c = false;
            }else {
                $('[name=register-captcha]').removeClass('is-invalid');
            }if($('[name=register-otp]').val().trim() == '') {
                $('[name=register-otp]').addClass('is-invalid');
                o = false;
            }else {
                $('[name=register-otp]').removeClass('is-invalid');
            }
        }
    })
    $('[name=register-email]').blur(() => {
        if($('[name=register-email]').val().trim() == '') {
            $('[name=register-email]').addClass('is-invalid');
            e = false;
        }
        else if(!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test($('[name=register-email]').val()))) {
            $('#email-status').text(`${$('[name=register-email]').val()} is not an email.`);
            e = false;
        }
        else {
            $('#email-status').text('');
            $('[name=register-email]').removeClass('is-invalid');
            $.ajax({
                url: '/register-check/email',
                type: 'post',
                data: {
                    email: $('[name=register-email]').val()
                },
                success(result) {
                    if(result.r == 'already used') {
                        $('#email-status').text(`${$('[name=register-email]').val()} has already used.`);
                        e = false;
                    }else if(result.r == 'can be used') {
                        $('#email-status').text('')
                        e = true;
                    }
                }
            })
        }
    })
    $('[name=register-username]').blur(() => {
        if($('[name=register-username]').val().trim() == '') {
            $('[name=register-username]').addClass('is-invalid');
            u = false;
        }else {
            $('[name=register-username]').removeClass('is-invalid');
            $.ajax({
            url: '/register-check/username',
            type: 'post',
            data: {
                username: $('[name=register-username]').val()
            },
            success(result) {
                if(result.r == 'already used') {
                    $('#username-status').text($('[name=register-username]').val() + " has " + result.r + ".");
                    u = false;
                }else if(result.r == 'can be used') {
                    $('#username-status').text('');
                    u = true;
                }
            }
        })
        }
    })
    $('[name=register-confirm]').blur(() => {
        if($('[name=register-password]').val().trim() == '') {
            $('[name=register-password]').addClass('is-invalid');
            p = false;
        }else if($('[name=register-password]').val().trim() != '') {
            $('[name=register-password]').removeClass('is-invalid');
        }
        if($('[name=register-confirm]').val().trim() == '') {
            $('[name=register-confirm]').addClass('is-invalid');
            p = false;
        }else if($('[name=register-confirm]').val().trim() != '') {
            $('[name=register-confirm]').removeClass('is-invalid');
        }
        if($('[name=register-password]').val() != $('[name=register-confirm]').val()) {
            $('#password-status').text('password does not match.');
            p = false;
        }if($('[name=register-password]').val() == $('[name=register-confirm]').val()) {
            $('#password-status').text('');
            p = true;
        }
    })
    $('[name=register-address]').blur(() => {
        if($('[name=register-address]').val().trim() == '') {
            $('[name=register-address]').addClass('is-invalid');
            a = false;
        }else {
            $('[name=register-address]').removeClass('is-invalid');
            a = true;
        }
    })
    $('[name=register-tel]').blur(() => {
        if($('[name=register-tel]').val().trim() == '') {
            $('[name=register-tel]').addClass('is-invalid');
            $("#tel-status").text('');
            t = false;
            return;
        }
        for(let i of $('[name=register-tel]').val()) {
            if(!$.isNumeric(i)) {
                t = false;
                $("#tel-status").text('Tel. must be number.');
                $('[name=register-tel]').removeClass('is-invalid');
                t = false;
                return;
            }
        }
        if(($('[name=register-tel]').val().length < 9) || ($('[name=register-tel]').val().length > 10)) {
            $("#tel-status").text('Tel. must has 9 or 10 digits');
            $('[name=register-tel]').removeClass('is-invalid')
            t = false;
        }else {
            $("#tel-status").text('');
            $.ajax({
                url: 'register-check/tel',
                type: 'post',
                data: {
                    tel: $('[name=register-tel]').val()
                },
                success(result) {
                    if(result.r == 'already used') {
                        $('#tel-status').text($('[name=register-tel]').val() + " has " + result.r);
                        t = false;
                    }else if(result.r == 'can be used') {
                        $('#tel-status').text('')
                        t = true;
                    }
                },
                complete() {
                    $('[name=register-tel]').removeClass('is-invalid')
                }
            })
        }
    })
    $('[name=register-captcha]').blur(() => {
        if($('[name=register-captcha]').val().trim() == '') {
            $('[name=register-captcha]').addClass('is-invalid');
            c = false;
        }else {
            $('[name=register-captcha]').removeClass('is-invalid')
            $.ajax({
                url: '/register-check/captcha',
                type: 'post',
                data: {
                    captcha: $('[name=register-captcha]').val()
                },
                success(result) {
                    if(result.r == 'correct') {
                        c = true;
                        $('#captcha-status').text('');
                    }else if(result.r == 'incorrect') {
                        c = false;
                        $('#captcha-status').text('Captcha code is incorrect.');
                    }
                }
            })
        }
    });
    $('#refresh').click(() => {
        document.getElementById('captcha-image').src = '/create-captcha?' + Math.random();
    })
    $('[name=register-otp]').blur(() => {
        if($('[name=register-otp]').val().trim() == '') {
            $('[name=register-otp]').addClass('is-invalid');
            o = false;
        }else {
            $('[name=register-otp]').removeClass('is-invalid');
            o = true;
        }
    })
    $('#send-again').click(() => {
        $('#otp-status').text('');
        otpSend();
        $('[name=register-otp]').text('');
    })

    
    /* Login */
    let loginU = false;
    let loginP = false;
    $('#login').click(() => {
        $('#login-status').text('');
        if(loginU && loginP) {
            $.ajax({
                url: '/login',
                type: 'post',
                data: {
                    login: 1,
                    username: $('[name=login-username]').val(),
                    password: $('[name=login-password]').val()
                },
                beforeSend() {
                    $('#loading').css('display', 'block');
                },
                success(result) {
                    if(result.r == 'Not found') {
                        setTimeout(function() {
                            $("#login-status").text('Username or password is incorrect.')
                        }, 500);
                    }else {
                        setTimeout(function() {
                            $("#login-status").text('')
                        }, 500);
                        setTimeout(function() {
                            location.href = '/category';
                        }, 500)
                    }
                },
                complete() {
                    setTimeout(function() {
                        $('#loading').css('display', 'none');
                    }, 500)
                }
            })
        }
    })
    $('[name=login-username]').blur(() => {
        if($('[name=login-username]').val() == '') {
            $('[name=login-username]').addClass('is-invalid');
            loginU = false;
        }else {
            $('[name=login-username]').removeClass('is-invalid')
            loginU = true;
        }
    })
    $('[name=login-password]').blur(() => {
        if($('[name=login-password]').val() == '') {
            $('[name=login-password]').addClass('is-invalid');
            loginP = false;
        }else {
            $('[name=login-password]').removeClass('is-invalid')
            loginP = true;
        }
    })
    $('[name=login-username]').keypress(() => $('#login-status').text(''))
    $('[name=login-password]').keypress(() => $('#login-status').text(''))
    const loginClose = () => {
        $('[name=login-password]').val('');
        $('#login-status').text('');
        $('[name=login-username]').removeClass('is-invalid');
        $('[name=login-password]').removeClass('is-invalid');
        $('#loading').css('display', 'none');
    }
    $('#login-close').click(() => loginClose());
    $('#login-cancel').click(() => loginClose());
})