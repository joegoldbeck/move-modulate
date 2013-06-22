$.ajax({
    url: '/moves/summary/daily',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data){
    console.log(data)
    var walkToday = data[0].summary[0].distance,
        walkYesterday = data[1].summary[0].distance,
        suggestedWalkTomorrow = (walkToday + walkYesterday)/2*1.02;


    $('.walk-yesterday').text(roundForDisplay(walkYesterday) + ' mi')
    $('.walk-today').text(roundForDisplay(walkToday) + ' mi')
    $('.walk-tomorrow').text(roundForDisplay(suggestedWalkTomorrow) + ' mi')

})

function roundForDisplay(num){
    return Math.round(num*10)/10
}
