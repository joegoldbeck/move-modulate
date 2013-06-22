$.ajax({
    url: '/moves/summary/daily',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data){

    var walkToday = data.walk.distance.slice(-1)[0],
        walkYesterday = data.walk.distance.slice(-2)[0],
        suggestedWalkTomorrow = (walkToday + walkYesterday)/2*1.02;

    $('.walk-yesterday').text(roundForDisplay(walkYesterday) + ' mi');
    $('.walk-today').text(roundForDisplay(walkToday) + ' mi');
    $('.walk-tomorrow').text(roundForDisplay(suggestedWalkTomorrow) + ' mi');

    var walkGraphData = _.pairs(_.object(data.dates, data.walk.distance))

    var walkGraph = $.jqplot('walk-graph',  [walkGraphData],
        {
            title: 'Graph of walking over last several days',
            axes: {xaxis:{renderer : $.jqplot.DateAxisRenderer}},
            series : [{
                lineWidth : 3,
                showMarker: false,
                shadow: false,
                rendererOptions: {
                  smooth: true
                }}]
        });

})

function roundForDisplay(num){
    return Math.round(num*10)/10
}
