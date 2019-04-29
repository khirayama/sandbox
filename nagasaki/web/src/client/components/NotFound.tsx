import * as React from 'react';

export interface Props {
  stopSaga?: () => void;
}

export class NotFound extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    if (props.stopSaga && !process.env.IS_BROWSER) props.stopSaga();
  }

  render() {
    // TODO: Head
    return (
      <React.Fragment>
        <h1>Not Found</h1>
      </React.Fragment>
    );
  }
}
