$(function() {
    let text = $('#data-info').text();
    let number;
    let price;
    let isSoldOut = false;
    $('#data-info').html(text);
    $('[name=option]').click(() => {
        number = $('[name=option]:checked').val().split(' ')[2];
        price = $('[name=option]:checked').val().split(' ')[1];
        $('.show-number > div:last').remove();
        if(number == 0) {
            $('#add-btn').css('display', 'none');
            $('.show-number').append('<div class="w-75 text-center mx-auto"><p class="fs-4 text-danger">This product has sold out.</p></div>');
            isSoldOut = true;
        }else {
            $('.show-number').html('');
            $('#add-btn').css('display', 'block');
            $('.show-number').append(`<div class="w-75 mx-auto"><input type="number" name="productNumber" class="form-control mx-auto" min="1" max="${number}" value="1"><p class="fs-5 text-center text-success">${number} pcs. left</p><p class="fs-4 text-center">${parseInt(price).toLocaleString("en-US")} THB / 1 pcs.</p></div>`)
        }
    })
    $('.btn-close').click(() => {
        $('.show-number > div:last').remove();
        $('[name=option]:checked').prop('checked', false);
    })
    $('#add-btn').click(() => {
        let choose = false;
        let numProduct = false;
        if($('[name=hidden]').val() == "has-type") {
            if(($('[name=option]:checked')).val() == undefined) {
                swal("Please select type.");
                choose = false;
                return;
            }else {
                choose = true;
            }
        }else if($('[name=hidden]').val() == "no-type") {
            choose = true;
        }
        if(isSoldOut) {
            return;
        }
        if(parseInt(document.getElementsByName('productNumber')[0].value) > parseInt(document.getElementsByName('productNumber')[0].max) || parseInt(document.getElementsByName('productNumber')[0].value) <= 0 || document.getElementsByName('productNumber')[0].value == '' || parseInt(document.getElementsByName('productNumber')[0].value) == NaN) {
            numProduct = false;
            document.getElementsByName('productNumber')[0].className += ' is-invalid';
        }else {
            numProduct = true;
            document.getElementsByName('productNumber')[0].className.replace(' is-invalid', '');
        }
        if(choose && numProduct) {
            if($('[name=hidden]').val() == "has-type"){
                $.ajax({
                    url: '/add-to-cart',
                    type: 'POST',
                    data: {
                        product_id: $('[name=productId]').val(),
                        type: $('[name=option]:checked').val().split(' ')[0],
                        number: document.getElementsByName('productNumber')[0].value,
                        price: price
                    },
                    success(result) {
                        swal({
                            title: "Complete",
                            text: "This product is added to cart",
                            icon: "success",
                            button: "OK",
                        }).then(() => {
                            location.href = '/view-product/' + $('[name=productId]').val();
                        })
                    }
                })
            }
            else if($('[name=hidden]').val() == "no-type") {
                $.ajax({
                    url: '/add-to-cart',
                    type: 'POST',
                    data: {
                        product_id: $('[name=productId]').val(),
                        number: document.getElementsByName('productNumber')[0].value,
                        price: $('[name=price]').val()
                    },
                    success(result) {
                        swal({
                            title: "Complete",
                            text: "This product is added to cart",
                            icon: "success",
                            button: "OK",
                        }).then(() => {
                            location.href = '/view-product/' + $('[name=productId]').val();
                        })
                    }
                })
            }   
        }
    })
    
    $('#buy-btn').click(() => {
        let choose = false;
        let numProduct = false;
        if($('[name=hidden]').val() == "has-type") {
            if(($('[name=option]:checked')).val() == undefined) {
                swal("Please select type.");
                choose = false;
                return;
            }else {
                choose = true;
            }
        }else if($('[name=hidden]').val() == "no-type") {
            choose = true;
        }
        if(isSoldOut) {
            return;
        }
        if(parseInt(document.getElementsByName('productNumber')[1].value) > parseInt(document.getElementsByName('productNumber')[1].max) || parseInt(document.getElementsByName('productNumber')[1].value) <= 0 || document.getElementsByName('productNumber')[1].value == '' || parseInt(document.getElementsByName('productNumber')[1].value) == NaN) {
            numProduct = false;
            document.getElementsByName('productNumber')[1].className += " is-invalid";
        }else {
            numProduct = true;
            document.getElementsByName('productNumber')[1].className.replace(' is-invalid', '');
        }
        if(choose && numProduct) {
            if($('[name=hidden]').val() == "has-type"){
                $.ajax({
                    url: '/buy-product',
                    type: 'POST',
                    data: {
                        product_id: $('[name=productId]').val(),
                        type: $('[name=option]:checked').val().split(' ')[0],
                        number: document.getElementsByName('productNumber')[1].value,
                        price: price
                    },
                    success(result) {
                        location.href = ('/cart/payment/' + result.id);
                    }
                })
            }
            else if($('[name=hidden]').val() == "no-type") {
                $.ajax({
                    url: '/buy-product',
                    type: 'POST',
                    data: {
                        product_id: $('[name=productId]').val(),
                        number: document.getElementsByName('productNumber')[1].value,
                        price: $('[name=price]').val()
                    },
                    success(result) {
                        location.href = ('/cart/payment/' + result.id);
                    }
                })
            }   
        }
    })
})