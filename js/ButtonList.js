function ButtonList(ul, lut)
{
    this._ul = ul;
    var self = this;

    $.each(
        lut,
        function(className, defaultState)
        {
            $(ul).append(
                $("<li>")
                    .addClass(className)
                    .addClass(defaultState ? "" : "inactive")
                    .append(
                        $("<button>")
                            .attr("value", className)
                            .append($("<span>"))
                            .append($("<span>"))
                            .click(button_click)
                    )
            );
        }
    );

    function button_click(event)
    {
        $(event.target).parent().toggleClass("inactive");
        $(self).trigger(
            "layerToggle", 
            [$(event.target).val(), $(event.target).parent().hasClass("inactive")]
        );
    }
    
}

ButtonList.prototype.clearValues = function() {
    $(this._ul).find("li button span:nth-of-type(2)").html("---");
};

ButtonList.prototype.setValue = function(className, value) {
    $(this._ul).find("li."+className).find("button span:nth-of-type(2)").html(value);
};