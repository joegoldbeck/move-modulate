$.ajax({
    url: '/moves/summary/daily',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data){
    $('.walk-today').text(data[20].summary[0].distance)
})
