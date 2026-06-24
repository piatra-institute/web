# The Basic Laws of Human Stupidity

## Abstract

In 1976 the economic historian Carlo M. Cipolla published a short, deadpan essay, *The Basic Laws of Human Stupidity*, that turned an apparently frivolous subject into a small, internally consistent theory. Its central device is a two-dimensional plane on which any action can be plotted by two quantities: how much it benefits the actor, and how much it benefits everyone else. The four quadrants of that plane define four behavioural types, the intelligent, the helpless, the bandit, and the stupid, and Cipolla's surprising claim is that the last of these is the most dangerous. This companion sets out the laws, the geometry, the model implemented in the playground, and the limits of taking the picture literally.

## Background: who was Cipolla

Carlo Maria Cipolla (1922 to 2000) was a serious economic historian, a professor at Berkeley and in Italy, known for work on monetary history, the economy of pre-industrial Europe, and the history of technology and clocks. *The Basic Laws of Human Stupidity* began as a private essay circulated among friends in English and was published in Italian in 1988 as part of *Allegro ma non troppo*. The tone is satirical, but the structure is that of a model: a set of axioms, a diagram, and consequences drawn from them. That is why it survives translation into a playground; underneath the jokes there is a small formal system.

## The five basic laws

Cipolla states five laws.

1. Always and inevitably everyone underestimates the number of stupid individuals in circulation.
2. The probability that a certain person is stupid is independent of any other characteristic of that person. Education, status, and profession do not protect against it.
3. The third, which Cipolla calls the golden law, is the operational definition: a stupid person is one who causes losses to another person or group while deriving no gain, and even possibly incurring losses, themselves.
4. Non-stupid people always underestimate the damaging power of stupid individuals, and constantly forget that to deal with stupid people is a costly mistake.
5. A stupid person is the most dangerous type of person.

The third law is the one the playground encodes. It is a behavioural definition, not a psychological one: stupidity is read off the outcome of an action, not off an intelligence test.

## The geometry: a two-axis plane

Place an action at a point with horizontal coordinate equal to the gain to the actor and vertical coordinate equal to the gain to others. Positive means benefit, negative means harm. The two signs cut the plane into four quadrants.

- **Intelligent**: gain to self positive, gain to others positive. The action helps the actor and helps everyone else.
- **Helpless (or naive)**: gain to self negative, gain to others positive. The actor loses while others benefit; the classic exploited or self-sacrificing party.
- **Bandit**: gain to self positive, gain to others negative. The actor profits by imposing a loss on others.
- **Stupid**: gain to self negative, gain to others negative. The action harms the actor and harms everyone else at once.

Cipolla's point is that the stupid quadrant is uniquely irrational and uniquely corrosive. A bandit at least follows a comprehensible logic of self-interest; you can predict and bargain with them. The stupid actor destroys value on both sides for no return, which makes their behaviour unpredictable and impossible to align with incentives. That is the content of the fifth law.

## The net-welfare diagonal

There is a natural second line on the plane: the diagonal where gain to self plus gain to others equals zero. Cipolla discusses it when he distinguishes between kinds of bandit. A bandit who takes exactly what the victim loses sits on this diagonal; total welfare is unchanged, only redistributed. A bandit whose gain exceeds the victim's loss is, in Cipolla's terms, an intelligent bandit who at least raises the total; one whose gain is smaller than the harm inflicted is sliding toward stupidity.

The diagonal therefore refines the two quadrants that straddle it. A helpless actor with a large benefit to others and a small cost to self is net-positive: society comes out ahead. A helpless actor whose self-loss outweighs the benefit to others is, in effect, half-stupid. The same split applies to bandits. The intelligent and stupid quadrants do not straddle the diagonal: an action that helps both is always net-positive, and one that harms both is always net-negative. The playground draws this diagonal as the P-O-M line and can shade the net-positive half-plane.

## The model in the playground

The playground has two layers, and it is important to keep them apart, because only one of them is testable.

### The deterministic classifier

The first layer is the classifier. Given a point, the function `classify(selfGain, otherGain)` returns its quadrant by reading the two signs, with the convention that a gain of zero counts as non-harmful (the positive side is closed). This is a direct encoding of Cipolla's third law and his diagram. It is exact, deterministic, and falsifiable against his definitions, which is why the calibration panel tests it: a point in each quadrant is classified, and the answer is checked against the type Cipolla's definitions require. There is nothing stochastic about this layer.

### The stochastic population model

The second layer is a toy structural model of how a whole population distributes itself across the four quadrants, and how that distribution might shift with national conditions. National macro indicators, GDP per capita, the Gini coefficient of inequality, a corruption-perceptions index, social trust, unemployment, the share of vulnerable people, and an education index, are mapped to four latent factors: prosperity, institutions, inequality, and stress. Those factors set the weights of a four-component bivariate normal mixture through a softmax over directional logits. Each component is centred in its own quadrant, and samples are reflected so they stay there. A seeded pseudo-random generator makes any single run reproducible.

The directional assumptions are deliberately simple and interpretable: better institutions push weight toward the intelligent quadrant, higher stress toward the stupid and helpless quadrants, higher inequality and weaker institutions toward banditry. These are plausible readings of the social-capital literature, but they are not fitted to data. There is no dataset that measures Cipolla coordinates for real populations, so this layer cannot be calibrated. It is a scaffold for thinking, not a prediction.

## Results you can see

Dragging a single point across the axes flips its quadrant label and its net-welfare sign at the two boundary lines, which makes Cipolla's definitions tangible. Switching country presets shifts the mixture weights and visibly rebalances the cloud: a high-trust, low-inequality profile crowds the intelligent quadrant, while a high-stress developing profile spreads mass into the stupid and helpless regions. The sensitivity control sharpens or softens how extreme those shares become. The population statistics panel reports the count in each quadrant and the split of helpless and bandit actors across the net-welfare diagonal.

## Limitations

The honest reading of this playground is narrow. The classifier faithfully encodes a definition; it does not measure anyone. The two-axis reduction itself is contestable: many real actions resist being scored on a single comparable scale of benefit to self versus benefit to others, and summing the two axes to get net welfare assumes they share units, which is a strong assumption. The macro model is a pedagogical caricature with hand-chosen coefficients and no empirical validation. Cipolla's essay is itself a satire, and treating its diagram as a literal map of human behaviour would be exactly the kind of overconfidence the first law warns against. What the playground supports is the qualitative structure: four behavioural types defined by two signs, a diagonal that distinguishes net-positive from net-negative actions, and the unsettling conclusion that the type which helps no one, not even itself, is the one we most reliably fail to anticipate.

## References

- Carlo M. Cipolla, *The Basic Laws of Human Stupidity*, 1976 (collected in *Allegro ma non troppo*, Il Mulino, 1988; English edition, Doubleday, 2011).
- Carlo M. Cipolla, *Allegro ma non troppo*, Il Mulino, 1988.
- On social trust and institutions as background for the macro layer: Robert D. Putnam, *Bowling Alone*, 2000; Transparency International, Corruption Perceptions Index methodology.
