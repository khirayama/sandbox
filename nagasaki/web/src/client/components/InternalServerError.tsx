import * as React from 'react';

export interface Props {
  stopSaga?: () => void;
}

export class InternalServerError extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    if (props.stopSaga && !process.env.IS_BROWSER) props.stopSaga();
  }

  render() {
    return (
      <React.Fragment>
        <h1>Internal Server Error</h1>
      </React.Fragment>
    );
  }
}
