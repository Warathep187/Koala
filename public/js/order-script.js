$(function() {
    for(let a of document.getElementsByClassName('address')) {
        a.innerHTML = a.innerText;
    }
    $('.set').click(() => {
        swal({
            title: "Are you sure?",
            text: "You are already delivered this product?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                if($(`[name=status-${window.location.href.slice(window.location.href.indexOf('#') + 1)}]`).val() == 'preparing') {
                    swal("Please change your order status.");
                }else {
                    $(`#form-${window.location.href.slice(window.location.href.indexOf('#') + 1)}`).submit();
                }
            }
        });
    })
})