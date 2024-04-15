import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import helper from '../services/helper';
class OrderableList extends Component {
    onDragEnd(result) {
        let items = helper.reorder(this.props.items, result.source.index, result.destination.index),
            activeIndex = this.props.activeIndex;
        //calculate active index
        let tmpArr = [result.source.index, result.destination.index, activeIndex].sort();
        if (activeIndex === result.source.index) {
            activeIndex = result.destination.index;
        } else {
            if (tmpArr[1] === activeIndex) {
                if (activeIndex > result.source.index) {
                    activeIndex--;
                } else {
                    activeIndex++;
                }
            }
        }
        if (this.props.onChange) {
            this.props.onChange({ items, activeIndex });
        }
    }
    render() {
        if (!this.props.items) return <p>Không có dữ liệu</p>
        return (<div className='orderable-list'>
            <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                        >
                            <div className='item header'>
                                {this.props.name}
                                {this.props.headerButtons ? this.props.headerButtons() : null}
                            </div>
                            {this.props.items.map((item, index) => {
                                return (<Draggable key={index} draggableId={`item-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>
                                            {this.props.renderItem ? this.props.renderItem(item, index) : null}
                                        </div>
                                    )}
                                </Draggable>)
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>)
    }
}

export default OrderableList;
