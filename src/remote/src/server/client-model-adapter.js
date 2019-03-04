const adaptVideoModelToUiVideoModel = serverSideVideos => serverSideVideos.map(video => ({
  ...video,
  type: 'video'
}));

module.exports = { adaptVideoModelToUiVideoModel };
