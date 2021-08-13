$(function() {
    $('#confirm').click(() => {
        let checkReason = true;
        if($('[name=reason]:checked').length == 0) {
            checkReason = false;
        }
        if(checkReason) {
            $.ajax({
                url: '/cancel-order',
                type: 'POST',
                data: {
                    transfer_id: window.location.href.slice(window.location.href.indexOf('#') + 1)
                },
                success(result) {
                    location.href = result.url;
                }
            })
        }
    })
    $('#close').click(() => {
        $('[name=reason]:checked').prop('checked', false);
    })
})