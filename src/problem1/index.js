var sum_to_n_a = function(n) {
    return n === 0 ? 0 : n * (Math.abs(n) + 1) / 2;
};

var sum_to_n_b = function(n) {
    if (n < 0) return -sum_to_n_b(-n);
    var sum = 0;
    for (var i = 1; i <= n; i++) sum += i;
    return sum;
};

var sum_to_n_c = function(n) {
    if (n < 0) return -sum_to_n_c(-n);
    if (n < 1) return 0;
    var half = Math.floor(n / 2);
    return 2 * sum_to_n_c(half) + half * half + (n % 2 ? n : 0);
};
