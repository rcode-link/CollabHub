export default (val: number, currency: any) => {
    return val.toLocaleString(currency?.format ?? "en-US", {
        style: "currency",
        currency: currency?.currency ?? "USD",
    });
};
