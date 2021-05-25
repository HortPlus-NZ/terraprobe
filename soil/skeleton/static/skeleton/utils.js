/*
    Helper functions that are used in multiple places. Not worrying about namespace yet
*/



    /*
    Promise.all([
    	await fetch('/graphs/api/vsw_reading/14/14-10-2019/29-04-2020/?format=json'),
    	await fetch('/graphs/api/vsw_strategy/14/14-10-2019/29-04-2020/?format=json')
    ]).then(function (responses) {
    // Get a JSON object from each of the responses
    return Promise.all(responses.map(function (response) {
        return response.json();
    }));
    }).then(function (data) {
    // Log the data to the console
    // You would do something with both sets of data here
    console.log(data)
    return data;
    }).catch(function (error) {
    // if there's an error, log it
    console.log(error);
    });
    */


/*
    Called in ajax returns to update the django messages
    $.ajax({
        url: "/ajax/process-onsite-reading/",
        dataType: 'json',
        success: function(result) {
            updateMessages(result.messages);
        }
    });
*/
function updateMessages(messages){
    $("#div_messages").empty();
    $.each(messages, function (i, m) {
                    $("#div_messages").append("<div class='alert " + m.extra_tags + " alert-dismissible' role='alert'>" +
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                    "<span aria-hidden='true'>&times;</span>" +
                    "</button>" +
                    m.message + "</div>");
    });
}

/*
    Called to populate Reading Recommendation box as well as calculate and reorganise day hours
*/
function updateReadingRecommendations(week_start_abbr, week_start) {
    function reorder(data, index) {
        return data.slice(index).concat(data.slice(0, index));
    }

    first_day = document.getElementById("week-days").firstElementChild.getAttribute("id");

    if (first_day != week_start_abbr) {
        wrapper = $('#week-days');

        var days_input = wrapper.children();

        arr = [0,1,2,3,4,5,6];
        arr = reorder(arr, week_start)
        wrapper.append( $.map(arr, function(v){ return days_input[v] }) );

        wrapper = $('#week-day-labels');
        var days_label = wrapper.children();
        wrapper.append( $.map(arr, function(v){ return days_label[v] }) );

        wrapper = $('#week-days-water');
        var days_water = wrapper.children();
        wrapper.append( $.map(arr, function(v){ return days_water[v] }) );
    }
}
