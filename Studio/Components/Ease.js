Studio.Ease = {};

Studio.Ease.linear = function(t) {
	return t;
};

Studio.Ease.snap = function(t) {
	return t + 0.5 | 0;
};

Studio.Ease.chillInOut = function(t) {
	var s = 0.75 ;
	if ((t *= 2) < 1) {
		return 0.5 * (t * t * ((s + 1) * t - s));
	}
	return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
};

Studio.Ease.backOut = function(t) {
	var s = 1.70158;
	return --t * t * ((s + 1) * t + s) + 1;
};

Studio.Ease.bounceOut = function(t) {
	if (t < (0.363636)) {
		return 7.5625 * t * t;
	} else if (t < 0.727272) {
		return 7.5625 * (t -= (0.545454)) * t + 0.75;
	} else if (t < 0.909090) {
		return 7.5625 * (t -= (0.818181)) * t + 0.9375;
	} else {
		return 7.5625 * (t -= (0.959595)) * t + 0.984375;
	}
};

Studio.Ease.elasticOut = function(t) {
	var s, a = 0.1, p = 0.4;
	if (t === 0) {
		return 0;
	}
	if (t === 1) {
		return 1;
	}
	if (!a || a < 1) {
		a = 1; s = p / 4;
	} else {
		s = p * Math.asin(1 / a) / (6.283);
	}
	return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (6.283) / p) + 1);
};

Studio.Ease.linearRandom = function(t) {
	return Math.random() * t;
};

Studio.Ease.random = function() {
	return Math.random();
};

Studio.Ease.shake = function() {
	return Math.random()-.5;
};

Studio.Ease.quadIn = function(t) {
	return t * t;
};

Studio.Ease.quadOut = function(t) {
	return t * (2 - t);
};

Studio.Ease.quadInOut = function(t) {
	if ((t *= 2) < 1) {
		return 0.5 * t * t;
	}
	return -0.5 * (--t * (t - 2) - 1);
};
