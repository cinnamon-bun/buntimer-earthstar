import React from 'react';

import '../css/layouts.css';

type Size = '0' | '1' | '2' | '3' | '4';

interface BoxProps {
    className?: string;
    style?: React.CSSProperties;
    size?: Size; // default 2
}
let boxClassName = (props: BoxProps): string => {
    let size = props.size || '2';
    let cls = `box box${size}`;
    cls += ' ' + (props.className || '');
    return cls;
};
export let Box = (props: React.PropsWithChildren<BoxProps>) => (
    <div className={boxClassName(props)} style={props.style}>
        {props.children}
    </div>
);

//================================================================================

// like a box but only add padding to top and bottom, not sides
interface VBoxProps {
    className?: string;
    style?: React.CSSProperties;
    size?: Size; // default 2
}
let vBoxClassName = (props: VBoxProps): string => {
    let size = props.size || '2';
    let cls = `vbox vbox${size}`;
    cls += ' ' + (props.className || '');
    return cls;
};
export let VBox = (props: React.PropsWithChildren<VBoxProps>) => (
    <div className={vBoxClassName(props)} style={props.style}>
        {props.children}
    </div>
);

//================================================================================

interface CardProps {
    className?: string;
    style?: React.CSSProperties;
    background?: string;
    color?: string;
}
export let Card = (props: React.PropsWithChildren<CardProps>) => {
    let style: React.CSSProperties = { ...props.style };
    if (props.background) {
        style.background = props.background;
    }
    if (props.color) {
        style.color = props.color;
    }
    return (
        <Box className={'card ' + (props.className || '')} style={style}>
            {props.children}
        </Box>
    );
};

//================================================================================

export let Indent = (props: React.PropsWithChildren<any>) => (
    <div className="indent">{props.children}</div>
);

//================================================================================

interface StackProps {
    className?: string;
    style?: React.CSSProperties;
    size?: Size; // default 2
    indent?: boolean;
}
let stackClassName = (props: StackProps): string => {
    let size = props.size || '2';
    let cls = `stack stack${size}`;
    cls += ' ' + (props.className || '');
    if (props.indent === true) {
        cls += ' indent';
    }
    return cls;
};
export let Stack = (props: React.PropsWithChildren<StackProps>) => (
    <div className={stackClassName(props)} style={props.style}>
        {props.children}
    </div>
);

//================================================================================

interface ClusterProps {
    className?: string;
    style?: any;
    align?: 'left' | 'center' | 'right' | 'justify' | 'stretch'; // default left
    valign?: 'top' | 'center' | 'bottom' | 'stretch' | 'baseline'; // default center
    wrap?: boolean; // default true
    size?: Size; // default 2
}
export const Cluster: React.FunctionComponent<ClusterProps> = (props) => {
    let size = props.size === undefined ? '1' : props.size;
    let alignClass = props.align ? 'cluster-align-' + props.align : '';
    let valignClass = props.valign ? 'cluster-valign-' + props.valign : '';
    let shouldWrap = props.wrap === undefined ? true : props.wrap;
    let wrapClass = shouldWrap ? 'cluster-wrap' : 'cluster-no-wrap';
    let sOuter: React.CSSProperties = {
        ...props.style,
        '--space': `var(--s${size})`,
    };
    // extra div is needed
    return (
        <div className={'cluster ' + (props.className || '')} style={sOuter}>
            <div className={`clusterInner ${alignClass} ${valignClass} ${wrapClass}`}>
                {props.children}
            </div>
        </div>
    );
};

export const ClusterStretch: React.FunctionComponent = (props) => (
    <div className="clusterSpacer" style={{ flexGrow: 1 }} />
);

//================================================================================

export let CardTitle = (props: React.PropsWithChildren<any>) => (
    <h3 className="cardTitle">{props.children}</h3>
);

export let SpacerDiv: React.FunctionComponent = () => <div>&nbsp;</div>;

export let SpacerSpan: React.FunctionComponent = () => <span>&nbsp;</span>;
