import React from "react";

interface DragAndDropProps {
    onDrop(files: any, event: DragEvent): void;

    force: boolean;

    getText(e: DragEvent): string;
}

interface DragAndDropState {
    drag: boolean;
    alt: boolean;
}

class DragAndDrop extends React.Component<DragAndDropProps, DragAndDropState> {
    state: DragAndDropState = {
        drag: false,
        alt: false
    }

    dragCounter = 0;
    lastEvent?: DragEvent;

    handleDrag = (event: DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.lastEvent = event;
        if (this.state.alt !== event.altKey) this.setState({alt: event.altKey});
    };

    handleDragIn = (event: DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.lastEvent = event;
        if (this.state.alt !== event.altKey) this.setState({alt: event.altKey});

        this.dragCounter++

        if (event.dataTransfer?.items &&
            event.dataTransfer?.items.length > 0) {
            this.setState({drag: true})
        }
    };

    handleDragOut = (event: DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.lastEvent = event;
        if (this.state.alt !== event.altKey) this.setState({alt: event.altKey});

        this.dragCounter--

        if (this.dragCounter === 0) {
            this.setState({drag: false})
        }
    };

    handleDrop = (event: DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.lastEvent = event;
        if (this.state.alt !== event.altKey) this.setState({alt: event.altKey});

        this.setState({drag: false})

        if (event.dataTransfer?.items &&
            event.dataTransfer?.items.length > 0) {
            this.props.onDrop(event.dataTransfer.items, event)
            event.dataTransfer.clearData()
            this.dragCounter = 0
        }
    };

    componentDidMount() {
        let el = document.body
        el.addEventListener('dragenter', this.handleDragIn)
        el.addEventListener('dragleave', this.handleDragOut)
        el.addEventListener('dragover', this.handleDrag)
        el.addEventListener('drop', this.handleDrop)
    }

    componentWillUnmount() {
        let el = document.body
        el.removeEventListener('dragenter', this.handleDragIn)
        el.removeEventListener('dragleave', this.handleDragOut)
        el.removeEventListener('dragover', this.handleDrag)
        el.removeEventListener('drop', this.handleDrop)
    }

    render() {
        return (
            <>
                {(this.state.drag || this.props.force) &&
                <div
                    id="drop"
                >
                    {this.props.getText((this.lastEvent ?? ({altKey: true} as any)))}
                </div>
                }
                {this.props.children}
            </>
        )
    }
}

export default DragAndDrop