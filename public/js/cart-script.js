$(function() {
    let price;
    let arrForCheck;
    $('[name=check]').click(() => {
        let arr = [];
        for(let i=0; i<$("input[name=check]:checked").length; i++) {
            arr.push(document.querySelectorAll('[name=check]:checked')[i].value)
        }
        arrForCheck = arr;
        if(arr.length == 0) {
            $('#delete').attr('disabled', 'disabled');
            $('#result').text(0);
            $('#buy').attr('disabled');
        }else {
            $('#delete').removeAttr('disabled');
            $('#buy').removeAttr('disabled');
            $.ajax({
                url: '/cal-result',
                type: 'POST',
                data: {
                    arrCartId: arr
                },
                success(result) {
                    $('#result').text(parseInt(result.r).toLocaleString("en-US"));
                }
            })
        }
    })
    $("#select-all").click(function(){
        if($(this).text() === "Select all") {
            $(this).text('Clear selected items');
            $("[name=check]").prop('checked', 'checked');
            let arr = [];
            for(let i=0; i<$("input[name=check]:checked").length; i++) {
                arr.push(document.querySelectorAll('[name=check]:checked')[i].value)
            }
            $('#delete').removeAttr('disabled');
            arrForCheck = arr;
            $.ajax({
                url: '/cal-result',
                type: 'POST',
                data: {
                    arrCartId: arr
                },
                success(result) {
                    price = result.r;
                    $('#result').text(parseInt(result.r).toLocaleString("en-US"));
                }
            })
        }else {
            $('#delete').attr('disabled', 'disabled');
            arrForCheck = [];
            $(this).text("Select all");
            $('[name=check]').prop('checked', '');
            $('#result').text(0);
        }
    })
    $('#delete').click(() => {
        if(arrForCheck.length == 0) {
            event.preventDefault();
        }else {
            $.ajax({
                url: '/delete-in-cart',
                type: 'POST',
                data: {
                    arrForDelete: arrForCheck
                },
                success(result) {
                    location.href = "/cart"
                }
            })
        }
    })
    $('#buy').click(() => {
        if(arrForCheck.length == 0) {
            event.preventDefault();
        }else {
            $('[name=checked]').val(arrForCheck.join(' '));
            $('form').submit();
        }
    })
})