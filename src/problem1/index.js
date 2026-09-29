var sum_to_n_a = function(n) {
    return n < 1 ? 0 : n * (n + 1) / 2;
};

var sum_to_n_b = function(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) sum += i;
    return sum;
};

var sum_to_n_c = function(n) {
    if (n <= 1) return n > 0 ? n : 0;
    var half = Math.floor(n / 2);
    return sum_to_n_c(half) + sum_to_n_c(n - half) + half * (n - half);
};
