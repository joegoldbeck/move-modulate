$('.btn.demo').click(function(){
    $.ajax({
        url: '/login/demouser',
        success: function(data, status){
        if (typeof(data.redirect) === 'string')
            window.location = data.redirect
        },
        xhrFields: {
            withCredentials: true
        }
    })
})
