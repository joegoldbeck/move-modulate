$.ajax({
    url: '/moves/summary/daily',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data){
    console.log(data)
    var walkToday = data[0].summary[0].distance,
        walkYesterday = data[1].summary[0].distance,
        suggestedWalkTomorrow = Math.round((walkToday + walkYesterday)/2*1.02);


    $('.walk-yesterday').text(walkYesterday)
    $('.walk-today').text(walkToday)
    $('.walk-tomorrow').text(suggestedWalkTomorrow)

})
