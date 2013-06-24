$.ajax({
    url: '/moves/summary/daily',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data){

    var desiredWeeklyIncreaseRate = 1.1

    var walkToday = data.walk.distance.slice(-1)[0]
    // suggest walking distance based on average distance centered around a week ago
    var suggestedWalkToday = data.walk.distance.slice(-11,-4).reduce(function(a,b){ return a + b })/7*desiredWeeklyIncreaseRate // ignores that curve will be exponential, but resulting overshoot is minimal
    var suggestedWalkTomorrow = data.walk.distance.slice(-10,-3).reduce(function(a,b){ return a + b })/7*desiredWeeklyIncreaseRate // ignores that curve will be exponential, but resulting overshoot is minimal


    $('.walked-today').text(roundForDisplay(walkToday) + ' mi')
    $('.walk-more-today').text(roundForDisplay(Math.max(suggestedWalkToday - walkToday, 0)) + ' mi')
    $('.walk-tomorrow').text(roundForDisplay(suggestedWalkTomorrow) + ' mi')

    var walkGraphData = _.pairs(_.object(data.dates, data.walk.distance))

    var suggestedWalkGraphData = [walkGraphData.slice(-2)[0], [data.dates.slice(-1)[0], suggestedWalkToday], [data.futureDates[0], suggestedWalkTomorrow]]

    var walkGraph = $.jqplot('walk-graph',  [walkGraphData, suggestedWalkGraphData],
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
                }},{
                lineWidth : 3,
                linePattern : 'dotted',
                showMarker: false,
                shadow: false,
                rendererOptions: {
                  smooth: true
                }}
                ],

           highlighter: {
             show: true,
             sizeAdjust: 7.5,
             tooltipAxes : 'y',
             useAxesFormatters: false,
             tooltipFormatString: '%.1f'
           }
        })

})

function roundForDisplay(num){
    return Math.round(num*10)/10
}
