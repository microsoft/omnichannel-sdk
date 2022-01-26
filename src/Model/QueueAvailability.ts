export default class QueueAvailability {

  /**
   * Boolean to check if the queue is available or not
   */
  public IsQueueAvailable!: boolean;

  /**
   * Specifies the average wait time for the conversation
   */
  public AverageWaitTime! : number;

  /**
   * Specifies the time till which the queue is available when queue is available
   */
  public AvailableUntil!: Date;

  /**
   * Specifies the time at which the queue will be available when the queue is not available
   */
  public AvailableNext!: Date;

  /**
   * Specifies the queue position
   */
  public QueuePosition!: number;

  /**
   * Specifies the name of the queue
   */
  public QueueName!: string;

  /**
   * Specifies the queue id
   */
  public QueueId!: string;

  /**
   * Boolean to specifiy if an agent in a queue is available when queue is available
   */
  public AgentAvailability!: boolean;
}