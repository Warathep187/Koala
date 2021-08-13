$(function() {
    $("#add").click(() => {
        let n = false;
        let inf = false;
        let t = false;
        let p = false;
        let num = false;
        let i = false;
        let typeArray = [];
        let priceArray = [];
        let numberArray = [];
        if($('[name=name]').val().trim() == '') {
            $('[name=name]').addClass('is-invalid');
            n = false;
        }else {
            $('[name=name]').removeClass('is-invalid');
            n = true;
        }
        if($('[name=information]').val() == '') {
            $('[name=information]').addClass('is-invalid');
            inf = false;
        }else {
            $('[name=information]').removeClass('is-invalid');
            inf = true;
        }
        if($('.setting > div').hasClass('first-input')) {
            if($('[name=price]').val().trim() == '' || !($.isNumeric($('[name=price]').val().trim()))) {
                p = false;
                console.log('p');
            }else {
                p = true;
            }
            if(($('[name=number]').val().trim() == '') || !($.isNumeric($('[name=number]').val().trim()))) {
                num = false;
                console.log('n');
            }else {
                num = true;
            }
            if(p && num) {
                t = true;
                $('#setting-status').text('');
            }else {
                $('#setting-status').text('Check setting data again.');
            }
        }else {
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
                for(let n of typeArray) {
                    if(typeArray.indexOf(n) != typeArray.lastIndexOf(n)) {
                        t = false;
                    }
                }
                if(!t) {
                    $('#setting-status').text('Check setting data again.')
                }else {
                    $('#setting-status').text('');
                    t = true;
                    p = true;
                    num = true;
                    $('[name=hiddenType]').val(typeArray.join(', '));
                    $('[name=hiddenPrice]').val(priceArray.join(', '));
                    $('[name=hiddenNumber]').val(numberArray.join(', '))
                }
            }else {
                $('#setting-status').text('Check setting data again.')
                t = false;
                p = false;
                num = false;
            }
        }
        if(($('[name=image]')[0].files.length == 0) || ($('[name=image]')[0].files.length > 15)) {
            i = false;
            $("[name=image]").addClass("is-invalid");
        }else {
            i = true;
            $("[name=image]").removeClass("is-invalid");
        }
        if(n && inf && t && p && num && i) {
            swal({
                title: 'Complete',
                text: "Adding complete.",
                icon: "success",
                button: "OK",
            }).then(() => {
                document.querySelector('form').submit();
            })
        }
    })
    $('#a').click(() => {
        if($('.setting > div').length == 7) {
            $('.setting').append(`<div class="d-flex my-2"><input type="text" name="type" maxlength="16" class="form-control" placeholder="type" required>
            <input type="text" name="type-price" maxlength="8" class="form-control mx-2" placeholder="price" required>
            <input type="number" name="type-number" class="form-control" placeholder="number" maxlength="6" min="1" value="1" required></div>`);
            $('#a').attr('disabled', 'disabled');
            event.preventDefault();
            return;
        }
        $('.first-input').remove();
        $('.setting').append(`<div class="d-flex my-2"><input type="text" name="type" maxlength="16" class="form-control" placeholder="type" required>
        <input type="text" name="type-price" maxlength="8" class="form-control mx-2" placeholder="price" required>
        <input type="number" name="type-number" class="form-control" placeholder="number" maxlength="6" min="1" value="1" required></div>`);
        $('#r').removeAttr('disabled');
    })
    $('#r').click(() => {
        if($('.setting > div').length == 8) {
            $('#a').removeAttr('disabled');
        }
        if($('.setting > div').length == 1) {
            $('.setting').append(`
                <div class="d-flex first-input">
                    <input type="text" style="width: 60%" class="form-control" name="price" placeholder="Product price">
                    <input type="number" style="width: 40%"  class="form-control ms-2" name="number" min="1" maxlength="7" placeholder="Number of product">
                </div>
            `)
            $('#r').attr('disabled', 'disabled');
            $('.setting div:first').remove()
            return;
        }
        $('.setting > div:last').remove()
    })
})