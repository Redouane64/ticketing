import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('POST /api/tickets', () => {
  it('has a route handler listening to /api/tickets for post request', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
  });

  it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
  });

  it('returns status other than 401 if the user is signed in', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('returns an error if invalid inputs are provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: '',
        price: 10,
      })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'test title',
        price: -10,
      })
      .expect(400);
  });

  it('creates a ticket with valid input', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'test title',
        price: 10,
      })
      .expect(201);

    // expect(natsWrapper.client.publish).toHaveBeenCalled();

    // tickets = await Ticket.find({});
    // expect(tickets.length).toEqual(1);
    // expect(tickets[0].price).toEqual(10);
  });

  // it('publishes an event', async () => {
  //   await request(app)
  //     .post('/api/tickets')
  //     .set('Cookie', global.signin())
  //     .send({
  //       title: 'test title',
  //       price: 10,
  //     })
  //     .expect(201);

  //   console.log(natsWrapper);
  // });
});
