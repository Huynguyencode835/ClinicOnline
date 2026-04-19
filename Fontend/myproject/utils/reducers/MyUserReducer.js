export default(current, acction) => {
    switch (acction.type){
        case "LOGIN":
            return acction.payload;
        case "LOGOUT":
            return null;
    }
    return current;
}