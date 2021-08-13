$(function() {
    let p = false;
    let c = false;
    $('[name=password]').blur(() => {
        if($('[name=password]').val().trim() == '') {
            $('[name=password]').addClass('is-invalid');
            p = false;
        }else {
            $('[name=password]').removeClass('is-invalid');
            p = true;
        }
    });
    $('[name=confirm]').blur(() => {
        if($('[name=confirm]').val().trim() == '') {
            $('[name=confirm]').addClass('is-invalid');
            c = false;
        }else {
            $('[name=confirm]').removeClass('is-invalid');
            c = true;
        }
    });
    $('#change').click(() => {
        if($('[name=password]').val() != $('[name=confirm]').val()) {
            $('#password-status').text('password does not match.');
            return;
        }
        if(p && c) {
            $.ajax({
                url: '/change-password/1',
                type: 'post',
                data: {
                    id: $('[type=hidden]').val(),
                    password: $('[name=password]').val()
                },
                beforeSend() {
                    $('#loading').css({'display': 'block'});
                },
                success(result) {
                    if(result.r == 'Successfully') {
                        $('#password-status').text('');
                        setTimeout(() => {
                            swal({
                                title: result.r,
                                text: "Change password complete",
                                icon: "success",
                                button: "OK",
                            }).then(() => {
                                location.href = "/";
                            });
                        }, 500)
                    }else if(result.r == 'Error') {
                        setTimeout(() => {
                            swal({
                                title: "Error",
                                text: "Please check your information again.",
                                icon: "error",
                                button: "OK",
                            }).then(() => {
                                location.href = '/';
                            })
                        }, 500)
                    }
                },
                complete() {
                    setTimeout(() => $('#loading').css({'display': 'none'}), 500)
                }
            })
        }
    })
    $('[name=password]').keypress(() => $('#password-status').text(''))
    $('[name=confirm]').keypress(() => $('#password-status').text(''))
})