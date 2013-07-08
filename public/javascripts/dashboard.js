// stuff to do as soon as document is loadded
$(function(){
    $('.ui-slider').hide()
});

// make API request immediately
$.ajax({
    url : '/moves/summary/daily',
    xhrFields : {
        withCredentials : true
    }
}).done(function(data){

    $(document).ready( function(){ // ensure document ready

        var desiredWeeklyIncreaseRate = 1.1

        var walkToday = data.walk.distance.slice(-1)[0]

        // suggest walking distance based on average distance centered around a week ago
        var walkAndSuggestedWalk = data.walk.distance.slice(-28,-1) // seed suggested walk with data from the past month except for today

        // add suggested walking for today with a minimum of how much have already walked
        walkAndSuggestedWalk.push(Math.max(walkToday, walkAndSuggestedWalk.slice(-10,-3).reduce(function(a,b){ return a + b })/7*desiredWeeklyIncreaseRate))

        for (var i = 0; i < 14; i++){ // calculate suggested walking for next 14 days
            walkAndSuggestedWalk.push(walkAndSuggestedWalk.slice(-10,-3).reduce(function(a,b){ return a + b })/7*desiredWeeklyIncreaseRate)
        }

        suggestedWalk = walkAndSuggestedWalk.slice(27) // starting from today

        $('.walked-today').text(roundForDisplay(walkToday) + ' mi')
        $('.walk-more-today').text(roundForDisplay(Math.max(suggestedWalk[0] - walkToday, 0)) + ' mi')
        $('.walk-tomorrow').text(roundForDisplay(suggestedWalk[1]) + ' mi')

        var walkGraphData = _.pairs(_.object(data.dates, data.walk.distance))

        var suggestedWalkGraphData = [[data.dates.slice(-1)[0], suggestedWalk[0]], [data.futureDates[0], suggestedWalk[1]], [data.futureDates[1], suggestedWalk[2]]]

        var fullGraphDateRange = data.dates.concat(data.futureDates.slice(0,2))

        var defaultGraphRangeIndices = [-28, -1] // show the last four weeks by default

        var walkGraph = $.jqplot('walk-graph',  [walkGraphData, suggestedWalkGraphData],
            {
                title: 'Daily walking distance',
                axes: {
                    xaxis: {
                        renderer         : $.jqplot.DateAxisRenderer,
                        tickOptions : {
                            formatString : '%d-%b-%Y'
                        },
                        min              : fullGraphDateRange.slice(defaultGraphRangeIndices[0])[0],
                        max              : fullGraphDateRange.slice(defaultGraphRangeIndices[1])[0],
                    },
                    yaxis : {
                        min : 0,
                        max : Math.ceil(Math.max.apply(null, data.walk.distance))
                    }
                },
                series : [{
                    lineWidth       : 3,
                    showMarker      : false,
                    shadow          : false,
                    rendererOptions : {
                        smooth : true
                    }
                },{
                    lineWidth       : 3,
                    linePattern     : 'dotted',
                    showMarker      : true,
                    shadow          : false,
                    rendererOptions : {
                        smooth : true
                    }
                }],
                highlighter: {
                    show                : true,
                    sizeAdjust          : 7.5,
                    tooltipAxes         : 'y',
                    useAxesFormatters   : false,
                    tooltipFormatString : '%.1f'
               }
            })

        $('#date-range-slider').slider({
            range: true,
            min: 0,
            max: fullGraphDateRange.length,
            values: [fullGraphDateRange.length+defaultGraphRangeIndices[0], fullGraphDateRange.length+defaultGraphRangeIndices[1]],
            slide: function( event, ui ) {
                walkGraph.replot({
                    axes: {
                        xaxis : {
                            min : fullGraphDateRange[ui.values[0]],
                            max : fullGraphDateRange[ui.values[1]]
                        }
                    }
                });
            }
        });

        $('.ui-slider').show()
    })

})

function roundForDisplay(num){
    return Math.round(num*10)/10
}
