import React from "react";
import {
  Container,
} from "reactstrap";

export default function Staking() {

  return (
    <>
      <div className="wrapper">
        <section className="section section-lg section-titles">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path3.png")}
          />
          <Container>
            Staking page
          </Container>
        </section>
      </div>
    </>
  );
}
