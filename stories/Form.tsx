import { action } from "@storybook/addon-actions";
import * as React from "react";
import { Lens, LensFlow } from "../";
import { validate } from "./validation";

export interface Person {
  age: number;
  name: string;
  code: string;
}

class Field<T> extends React.Component<{
  lens: Lens<T>;
  type?: string;
  label?: string;
}> {
  private onChange: (e: any) => void;
  private onBlur: () => void;

  constructor(props: any) {
    super(props);

    this.onChange = (e: any) => {
      const { lens } = this.props;
      lens.set(e.target.value);
      this.props.lens.state.prop("errorLock").set(false);
    };

    this.onBlur = () => {
      this.props.lens.state.prop("errorLock").set(true);
    };
  }

  public render() {
    const { lens, label = "", type = "text" } = this.props as any;
    const style = { marginTop: 20, padding: 4 } as any;
    const showError = lens.getOriginViewState("showErrors");

    const hasError =
      showError &&
      lens.isInvalid() &&
      lens.state
        .prop("errorLock")
        .defaultValue(true)
        .get();

    if (hasError) {
      style.border = "1px solid red";
    }

    return (
      <div style={style}>
        <div>{label}</div>
        <input
          type={type}
          value={lens.get() as any}
          onChange={this.onChange}
          onBlur={this.onBlur}
        />
      </div>
    );
  }
}

type IStringField = new () => Field<string>;
const StringField = Field as IStringField;

type INumberField = new () => Field<number>;
const NumberField = Field as INumberField;

class Form extends React.Component<{ lens: Lens<Person> }> {
  private submit = () => {
    const { lens } = this.props;
    const showErrorLens = lens.state.prop("showErrors");

    if (lens.isInvalid()) {
      showErrorLens.set(true);
      return;
    }

    showErrorLens.set(false);

    action("submit")(lens.get());
  }

  public render() {
    const { lens } = this.props;

    return (
      <div>
        <button onClick={this.submit}>Submit</button>
        <StringField label="Name" lens={lens.prop(p => p.name)} />
        <NumberField label="Age" lens={lens.prop(p => p.age)} type="number" />
        <StringField label="Code" lens={lens.prop(p => p.code)} />
      </div>
    );
  }
}

export class FormPlaygound extends React.Component<{}, any> {
  public state = {} as any;

  public getMeta = () => ({
    props: {
      name: { isRequired: true },
      code: {
        customValidators: [
          (code: any) =>
            (!code || code.indexOf("abc") !== 0) && "Code must start from abc",
        ],
      },
    },
  })

  private lens = new LensFlow(
    () => this.state.data,
    data => {
      this.state.data = data;
      this.forceUpdate();
    },
    this.getMeta,
    (meta, value) => validate(value, meta),
    () => this.state.view,
    view => {
      this.state.view = view;
      this.forceUpdate();
    }
  );

  public render() {
    return (
      <div>
        <Form lens={this.lens} />
        <pre>{JSON.stringify(this.lens.get(), null, "  ")}</pre>
      </div>
    );
  }
}
