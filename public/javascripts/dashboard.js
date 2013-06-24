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
            title: 'Daily walking distance since you started using Moves',
            axes: {
                xaxis: {
                    renderer : $.jqplot.DateAxisRenderer,
                    tickOptions : {
                        formatString : '%d-%b-%Y'
                    },
                    min : data.dates[0]
                },
                yaxis: {
                    min : 0,
                    max : Math.ceil(Math.max.apply(null, data.walk.distance))
                }
            },
            series : [{
                lineWidth : 3,
                showMarker: false,
                shadow: false,
                rendererOptions: {
                  smooth: true
                }}],

           highlighter: {
             show: true,
             sizeAdjust: 7.5,
             tooltipAxes : 'y',
             useAxesFormatters: false,
             tooltipFormatString: '%.1f'
           }
        });

})

function roundForDisplay(num){
    return Math.round(num*10)/10
}
