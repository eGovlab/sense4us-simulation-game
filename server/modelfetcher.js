module.exports = function()
{
	var that = {
		fetch_model: function(req, res)
		{
			console.log("fetch: " + req.params["fetch"]);
			res.render("index.html");
		},

		fetch_client: function(req, res)
		{
			res.render("index.html");
		}
	}

	return that;
}