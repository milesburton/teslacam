TAG    := $$(git log -1 --pretty=%h)

build:
	@docker build -t teslacam/dashcam-monitor:${TAG} .
	@docker build -f Dockerfile.rotate -t teslacam/clean-recent-clips:${TAG} .
	@docker build -f Dockerfile.rsync -t teslacam/dashcam-rsync-upload:${TAG} .
	@docker tag teslacam/dashcam-monitor:${TAG} teslacam/dashcam-monitor:latest
	@docker tag teslacam/clean-recent-clips:${TAG} teslacam/clean-recent-clips:latest
	@docker tag teslacam/dashcam-rsync-upload:${TAG} teslacam/dashcam-rsync-upload:latest

push:
	@docker push teslacam/dashcam-monitor
	@docker push teslacam/dashcam-rsync-upload
	@docker push teslacam/clean-recent-clips
