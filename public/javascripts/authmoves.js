console.log('script loaded')

$('#demo').click(function(){
    $.ajax({
        url: '/startdemo',
        success: function(data, status){
        if (typeof(data.redirect) === 'string')
            window.location = data.redirect
        },
        xhrFields: {
            withCredentials: true
        }
    });
});
