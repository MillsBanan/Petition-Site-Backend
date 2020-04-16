exports.theMimeIsRight = function  (mime) {
    switch (mime) {
        case 'image/jpeg':
            return true;
        case 'image/png':
            return true;
        case 'image/gif':
            return true;
        default:
            return false;
    }
};

exports.getMimeType = function (filename) {
    const extension = filename.split('.').pop();
    if (extension === 'png') {
        return 'image/' + extension;
    } else if (extension === 'jpeg' || extension === 'jpg') {
        return 'image/jpeg';
    } else if (extension === 'gif') {
        return 'image/gif';
    } else {
        return null;
    }
};


