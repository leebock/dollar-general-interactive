L.RetailMarkerGroup = L.FeatureGroup.extend({

    initialize: function(layers, icon, pane)
    {
        L.FeatureGroup.prototype.initialize.call(this, layers);      
        this._icon = icon;
        this._pane = pane;
    },

    /*************************************************/
    /******************* METHODS *********************/
    /*************************************************/
    
    addIcons: function(records)
    {
        var self = this;
        $.each(
            records, 
            function(index, record) {
                L.marker(
                     record.getLatLng(), 
                     {
                         icon: self._icon,
                         pane: self._pane
                     }
                 )
                     .bindPopup(
                         record.getName()+"<br>"+
                         record.getAddress()+"<br>"+
                         record.getCity()+", "+record.getState(), 
                         {closeButton: false}
                     )
                     .bindTooltip(
                         record.getCity()+", "+record.getState()							
                     )
                     .addTo(self);                
            }
        );	        
    }

});

L.retailMarkerGroup = function(layers, icon, pane) {
    return new L.RetailMarkerGroup(layers, icon, pane);
};