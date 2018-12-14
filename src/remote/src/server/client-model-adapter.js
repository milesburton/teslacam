const adaptVideoModelToUiVideoModel = (serverSideVideos) => {

    return serverSideVideos.map(video=>({
        ...video,
        type: 'video'
    }));

};

module.exports = {adaptVideoModelToUiVideoModel};
