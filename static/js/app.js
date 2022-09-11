var EPSILON = 0.0001;

function bisection(func, params, a, b){
	/*
	if (func(a, params) * func(b, params) >= 0){
		console.log("Incorrect a and b", a, b, func(a, params), func(b, params));
		return;
	}
	*/
	
	console.log(params)
	console.log(a,b)
	
	let c = a;
	while ((b-a) >= EPSILON){
		// Find middle point
		c = (a+b)/2;
		// Check if middle point is root
		if (func(c, params) == 0.0)
			break;
		// Decide the side to repeat the steps
		else if (func(c, params)*func(a, params) < 0)
			b = c;
		else
			a = c;
	}
	console.log(c)
	return c;
}

// Example case of volatility iterative search for AAPL given a premium
function volEstimation(sig, params){
	//var P = 5, C = 1, S = 161, K = 160, t = 5/365, I = 0.01;
	return premiumDiff(sig, params.P, params.C, params.S, params.K, params.t, params.I);
}


function premiumDiff(sig, P, C, S, K, t, I){
	var d1 = (Math.log(S/K) + (I + Math.pow(sig,2)/2) * t) / (sig*Math.sqrt(t)),
		d2 = (Math.log(S/K) + (I - Math.pow(sig,2)/2) * t) / (sig*Math.sqrt(t));

	var fv_strike = K*Math.exp(-1*I*t);

	//For calculating CDF and PDF using gaussian library
	var distribution = gaussian(0, 1);

	if (C==1){
		// Call Premium
		premium = S * distribution.cdf(d1) - fv_strike * distribution.cdf(d2);
	}else{
		// Put Premium
		premium = premium = - S * distribution.cdf(-1*d1) + fv_strike * distribution.cdf(-1*d2);
	}
	
	return P-premium;
}

function optionsPricing(sig, S, K, t, I){
	var d1 = (Math.log(S/K) + (I + Math.pow(sig,2)/2) * t) / (sig*Math.sqrt(t)),
		d2 = (Math.log(S/K) + (I - Math.pow(sig,2)/2) * t) / (sig*Math.sqrt(t));

	var fv_strike = K*Math.exp(-1*I*t);

	//For calculating CDF and PDF using gaussian library
	var distribution = gaussian(0, 1);

	//Premium Price
	var call_premium = S * distribution.cdf(d1) - fv_strike * distribution.cdf(d2),
		put_premium = - S * distribution.cdf(-1*d1) + fv_strike * distribution.cdf(-1*d2);
	
	return [call_premium, put_premium];
}



function optionsGreeks(sig, S, K, t, I){
	
}



$(document).ready(function(e) {  
	
	// Volatility Estimation
	//var P = 5, C = 1, S = 161, K = 160, t = 5/365, I = 0.01, sig=0.3;
	//console.log(premiumDiff(sig, P, C, S, K, t, I))

	
    jQuery(".datetimepicker").datetimepicker({
        format:"Y-m-d H:i:00",
        mask:true,
        minDate:'+2',
        defaultDate:'+1970/01/02',
        defaultTime:'23:59',
        value:'+1'
    });

	var ivform = "#iv-calc";
	$(ivform).submit(function(e) {
		e.preventDefault();
		
		$("#iv-results").css("display","none");
		
    	var spot = parseFloat($(ivform+" "+"#input-spot").val()),
			strike = parseFloat($(ivform+" "+"#input-strike").val()),
			expiry = $(ivform+" "+"#datetimepicker").val(),
			prem = parseFloat($(ivform+" "+"#input-prem").val()),
			int_rate = parseFloat($(ivform+" "+"#input-intrate").val()),
			inp_type = parseInt($(ivform+" "+"input[name='input-type']:checked").val());

		expiry = expiry.replace(" ", "T");
		var date_expiry = new Date(expiry),
			date_now = new Date();
		var seconds = Math.floor((date_expiry - (date_now))/1000),
			minutes = Math.floor(seconds/60),
			hours = Math.floor(minutes/60),
			delta_t = (Math.floor(hours/24))/365.0;
		var int_rate = int_rate/100;

		var params = {P: prem, C: inp_type, S: spot, K: strike, t: delta_t, I: int_rate};
		//console.log(params)
		
		var sigma_est = bisection(volEstimation, params, 0, 1);
		
		
		$("#option-volatility-value").text(sigma_est.toFixed(3));
		
		// Colouring the numbers
		$("#iv-results .results-value").removeClass('negative positive zero');

		$("#iv-results .results-value").filter(function() {						
				return ($(this).text() == 0);
		}).addClass('zero');
		
		$("#iv-results .results-value").filter(function() {						
				return ($(this).text() < 0);
		}).addClass('negative');

		$("#iv-results .results-value").filter(function() {						
				return ($(this).text() > 0);
		}).addClass('positive');

		$("#iv-results").css("display","inline");		
		
		return false;
	})
	
	
	
	var premform = "#premium-calc";
    $(premform).submit(function() {

    	$("#premium-results").css("display","none");

    	var spot = parseFloat($(premform+" "+"#input-spot").val()),
			strike = parseFloat($(premform+" "+"#input-strike").val()),
			expiry = $(premform+" "+"#datetimepicker").val(),
			volt = parseFloat($(premform+" "+"#input-volt").val()),
			int_rate = parseFloat($(premform+" "+"#input-intrate").val());
			//div_yld = parseFloat($("#input-divyld").val());

		//Validation
		var error=null;

		if(isNaN(spot) || isNaN(strike) || isNaN(volt) || isNaN(int_rate)) {
			error = "Invalid Values";	
			$("#errors").text(error);
			$("#errors").css("display", "inline");
		}else if(spot < 0 || strike < 0) {
			error = "Spot and Strike should be positive values";			
			$("#errors").text(error);
			$("#errors").css("display", "inline");
		}else if(volt <0) {
			error = "Voltality should be greater than 0";			
			$("#errors").text(error);
			$("#errors").css("display", "inline");
		}else if(int_rate <0 || int_rate >100) {
			error = "Interest rate should be between 0 - 100";			
			$("#errors").text(error);
			$("#errors").css("display", "inline");
		}else {			

			expiry = expiry.replace(" ", "T");

			var date_expiry = new Date(expiry),
				date_now = new Date();

			var seconds = Math.floor((date_expiry - (date_now))/1000),
				minutes = Math.floor(seconds/60),
				hours = Math.floor(minutes/60),
				delta_t = (Math.floor(hours/24))/365.0;

			var volt = volt/100,
				int_rate = int_rate/100;

			if(hours < 24) {
				error = "Please select a later date and time <br> Expiry should be minimum 24 hours from now";
				$("#errors").html(error);
				$("#errors").css("display", "inline");
			}else {

				$("#errors").css("display", "none");

				var d1 = (Math.log(spot/strike) + (int_rate + Math.pow(volt,2)/2) * delta_t) / (volt*Math.sqrt(delta_t)),
					d2 = (Math.log(spot/strike) + (int_rate - Math.pow(volt,2)/2) * delta_t) / (volt*Math.sqrt(delta_t));

				var fv_strike = (strike)*Math.exp(-1*int_rate*delta_t);

				//For calculating CDF and PDF using gaussian library
				var distribution = gaussian(0, 1);

				//Premium Price
				var call_premium = spot * distribution.cdf(d1) - fv_strike * distribution.cdf(d2),
					put_premium = fv_strike * distribution.cdf(-1*d2) - spot * distribution.cdf(-1*d1);

				//Option greeks
				var call_delta = distribution.cdf(d1),
					put_delta = call_delta-1;

				var call_gamma = distribution.pdf(d1)/(spot*volt*Math.sqrt(delta_t)),
					put_gamma = call_gamma; 

				var call_vega = spot*distribution.pdf(d1)*Math.sqrt(delta_t)/100,
					put_vega = call_vega;

				var call_theta = (-1*spot*distribution.pdf(d1)*volt/(2*Math.sqrt(delta_t)) - int_rate*fv_strike*distribution.cdf(d2))/365,
					put_theta = (-1*spot*distribution.pdf(d1)*volt/(2*Math.sqrt(delta_t)) + int_rate*fv_strike*distribution.cdf(-1*d2))/365;

				var call_rho = fv_strike*delta_t*distribution.cdf(d2)/100,
					put_rho = -1*fv_strike*delta_t*distribution.cdf(-1*d2)/100;
				
				$("#call-option-prem-value").text(call_premium.toFixed(2));
				$("#put-option-prem-value").text(put_premium.toFixed(2));
				$("#call-option-delta-value").text(call_delta.toFixed(3));
				$("#put-option-delta-value").text(put_delta.toFixed(3));
				$("#option-gamma-value").text(call_gamma.toFixed(4));
				$("#call-option-theta-value").text(call_theta.toFixed(3));
				$("#put-option-theta-value").text(put_theta.toFixed(3));
				$("#class-option-rho-value").text(call_rho.toFixed(3));
				$("#put-option-rho-value").text(put_rho.toFixed(3));
				$("#option-vega-value").text(call_vega.toFixed(3));
				
				// Colouring the numbers
				$("#premium-results .results-value").removeClass('negative positive zero');

				$("#premium-results .results-value").filter(function() {						
				        return ($(this).text() == 0);
				}).addClass('zero');
				
				$("#premium-results .results-value").filter(function() {						
				        return ($(this).text() < 0);
				}).addClass('negative');

				$("#premium-results .results-value").filter(function() {						
				        return ($(this).text() > 0);
				}).addClass('positive');

				$("#premium-results").css("display","inline");
			}
		}

		return false;

 	});

})




