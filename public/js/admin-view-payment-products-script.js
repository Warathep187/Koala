$(function() {
    $('#confirm').click(() => {
        $.ajax({
            url: "/confirm-or-cancel/" + $('[name=paymentID]').val(),
            type: 'post',
            data: {
                type: "confirm"
            },
            success(result) {
                swal({
                    title: "Confirmed",
                    text: "This order has confirmed.",
                    icon: "success",
                    button: "Okay",
                }).then(() => location.href = '/admin-orders');
            }
        })
    })
    $('#cancel').click(() => {
        swal({
            title: "Are you sure?",
            text: "Do you want to cancel this order?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(willDelete => {
            if(willDelete) {
                $.ajax({
                    url: "/confirm-or-cancel/" + $('[name=paymentID]').val(),
                    type: 'post',
                    data: {
                        type: "cancel"
                    },
                    success(result) {
                        location.href = '/admin-orders';
                    }
                })
            }
        })
    })
})