$(function() {
    $('[name=information]').val($('[name=information').val().replace(/<br>/g, '\n'));
    $('#save').click(() => {
        let n = false;
        let i = false;
        let t = false;
        let typeArray = [];
        let priceArray = [];
        let numberArray = [];
        if($('[name=name]').val().trim() == '') {
            n = false;
            $('[name=name]').addClass('is-invalid');
        }else {
            n = true;
            $('[name=name]').removeClass('is-invalid');
        }
        if($('[name=information]').val().trim() == '') {
            i = false;
            $('[name=information]').addClass('in-invalid');
        }else {
            i = true;
            $('[name=information]').removeClass('in-invalid');
        }
        if($('[name=check-type').val() === 'type') {
            $('[name=type]').each((idx, value) => {
                if(value.value == '') {
                    return;
                }
                typeArray.push(value.value.replace(/ /g, '-'));
            })
            $('[name=type-price]').each((idx, value) => {
                if(!$.isNumeric(value.value) || (value.value == '')) {
                    return;
                }
                priceArray.push(value.value);
            })
            $('[name=type-number]').each((idx, value) => {
                if(!$.isNumeric(value.value) || (value.value == '')) {
                    return;
                }
                numberArray.push(value.value);
            })
            if(typeArray.length === priceArray.length && priceArray.length === numberArray.length) {
                t = true;
                $('[name=hiddenType]').val(typeArray.join(', '));
                $('[name=hiddenPrice]').val(priceArray.join(', '));
                $('[name=hiddenNumber]').val(numberArray.join(', '))
            }else {
                t = false;
            }
            if(!t) {
                $('#status').html('<p class="text-danger fs-5">Check setting data again.</p>');
            }else {
                $('#status').html('');
            }
        }else if($('[name=check-type]').val() === 'no-type') {
            if(!$.isNumeric($('[name=price]').val()) || $('[name=price]').val().trim() == '') {
                t = false
            }else {
                t = true;
            }
            if(!$.isNumeric($('[name=number]').val()) || $('[name=number]').val().trim() == '') {
                t = false;
            }else {
                t = true;
            }
            if(!t) {
                $('#status').html('<p class="text-danger fs-5">Check setting data again.</p>');
            }else {
                $('#status').html('');
            }
        }
        if(n && i && t) {
            if($('[name=check-type]').val() == 'type') {
                $.ajax({
                    url: '/update-product-info/'+"<%= data._id %>",
                    type: 'POST',
                    data: {
                        name: $('[name=name]').val(),
                        information: $('[name=information]').val(),
                        types: $('[name=hiddenType]').val(),
                        prices: $('[name=hiddenPrice]').val(),
                        cate: $('[name=cate]').val(),
                        numbers: $('[name=hiddenNumber]').val()
                    },
                    success(result) {
                        swal({
                            title: 'Complete',
                            text: "Adding complete.",
                            icon: "success",
                            button: "OK",
                        }).then(() => {
                            "<% if(locals.admin) { %>"
                                location.href = '/admin-manage-products'
                            "<% }else { %>"
                                location.href = '/manage-product/'+$('[name=userId]').val();
                            "<% } %>"
                        })
                    }
                })
            }else if($('[name=check-type]').val() == 'no-type') {
                $.ajax({
                    url: '/update-product-info/'+"<%= data._id %>",
                    type: 'POST',
                    data: {
                        name: $('[name=name]').val(),
                        information: $('[name=information]').val(),
                        price: $('[name=price]').val(),
                        cate: $('[name=cate]').val(),
                        number: $('[name=number]').val()
                    },
                    success(result) {
                        swal({
                            title: 'Complete',
                            text: "Adding complete.",
                            icon: "success",
                            button: "OK",
                        }).then(() => {
                            "<% if(locals.admin) { %>"
                                location.href = '/admin-manage-products'
                            "<% }else { %>"
                                location.href = '/manage-product/'+$('[name=userId]').val();
                            "<% } %>"
                        })
                    }
                })
            }
        }
    })
})